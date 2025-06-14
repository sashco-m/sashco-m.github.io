---
title: "Six Degrees of Kevin Bacon (How to build a graph visualizer)"
date: 2025-06-14T02:15:00-04:00
tags: ['project', 'software']
---

I've always found it fun to explore the connections between things. I decided to build a simple graph exploring site, [imdb.mistelbacher.ca](https://imdb.mistelbacher.ca), so that I could spend a couple hours clicking on actors (and maybe learn a thing or two about development in 2025).

<!--more-->

# Inspiration

During my last term at Waterloo, I took a database course where the final project was to make movie database app. One of the advanced features I added was a recursive SQL query that found how a root actor relates to other actors, through their shared movies. Something like:

```SQL
WITH RECURSIVE six_degrees AS (
    SELECT 
        p.id AS root_person_id,
        p.id AS connected_person_id,
        NULL as title_id,
    FROM person p
    WHERE p.id = ?

    UNION ALL

    SELECT
        c1.person_id as root_person_id,
        c2.person_id as connected_person_id,
        c2.title_id,
    FROM
        six_degrees sd
    JOIN character c1 ON c1.person_id = sd.connected_person_id
    JOIN character c2 ON c2.title_id = c1.title_id AND c2.person_id != c1.person_id
)
SELECT 
    sd.degree, 
    root.id as root_person_id,
    root.name as root_actor_name,
    connected.id as connected_person_id,
    connected.name AS connected_actor_name,
    t.primary_title
FROM six_degrees sd
JOIN person root ON root.id = sd.root_person_id
JOIN person connected ON connected.id = sd.connected_person_id
LEFT JOIN title t ON t.id = sd.title_id
ORDER BY sd.degree
```

But SQL databases really struggle with recursive queries, especially on large datasets (we were using the full IMDB non-commercial dataset with over 10 million movies, and my .sqlite file was 10gb). I knew I wanted to go back and design around this feature from the ground up.

# Plan

The plan was to use a graph database, specifically the [apache AGE](https://age.apache.org/) extension for Postgres, to power a graph for the user to explore. I chose NestJS and React for the frontend since I use both at work and wanted to get some more reps in. I'd use the IMDB non-commercial dataset to power the app.

# Goals

The goal was twofold: to make something fun, but also to master the basics. I wanted to 
- take the time to set up an easy to use, dockerized, hot-reloading development setup
- create an optimized production deployment, hosted on a VM with nginx and HTTPS all configured by me
- practice using LLM tools to see where I can find productivity increases
- above all, to understand every little thing that happened along the whole process.

# Building the App

## Data Loading

The first thing to do was to load data into the DB. Since Apache AGE is built on top of a SQL database, writing queries is a little funky. I made a simple wrapper that takes just the openCypher query and handles formatting and output parsing (and ensures the output is nicely typed).

```ts
async runCypher<T>(
    query: string,
    params: Record<string, any> = {},
    columns: string[] = ['result'],
  ): Promise<T[]> {
    const text = `
      SELECT * FROM cypher(
        '${this.graphName}',
        $$ ${query} $$,
        $1
      ) AS (
        ${columns.map((c) => `${c} agtype`).join(',')}
      )
    `;
    const values = [params ? JSON.stringify(params) : 'NULL'];
    const res = await this.client.query(text, values);
    return res.rows.map((row: Record<string, any>) => {
      const parsedRow: Record<string, any> = {};
      for (const col of columns) {
        const ag = row[col];
        // could be an object (node/edge) or a scalar
        if (typeof ag !== 'object') {
          parsedRow[col] = ag;
          continue;
        }

        const props = ag?.get('properties');
        parsedRow[col] =
          props instanceof Map ? this.mapToObject(props) : (props ?? ag);
      }
      return parsedRow;
    });
  }
```

The file [import.ts](https://github.com/sashco-m/graph-visualizer/blob/0d821d2738c61bae66f7e057bfe640d2d9ca4da3/backend/src/imdb/import.ts) then handles:
- downloading & unzipping each of the IMDB files needed
- streaming the TSV files into batches of 50k for inserts
- cleaning up the TSV's

One big issue was the speed, especially of the following cypher that inserted actor relationships:
```SQL
UNWIND $rels AS rel
MATCH (p:Person {id: rel.personId}), (m:Movie {id: rel.movieId})
CREATE (p)-[:ACTED_IN]->(m)
```

The MATCH (like a SQL SELECT) was taking forver. I did some research online and found that this could be sped up dramatically with a bit of a hack. Apachge AGE has underlying tables with JSONB columns that store the properties of a node. What you can do is make a GIN index on these JSONB columns, like so:

```sql
CREATE INDEX person_properties_gin ON imdb_graph."Person" USING GIN (properties);

CREATE INDEX movie_properties_gin ON imdb_graph."Movie" USING GIN (properties);
```

The whole data load process can then be kicked off from inside the container with `npm run import`, and completes in under an hour.

## Making the graph

I also wanted to touch on some of the things I did to improve the graph UX:
- New nodes are placed randomly in a circle around the node that was clicked. I tried having nodes "stream" in but I found it more annoying than having it all appear instantly

- If there are multiple edges between the same actor, they are grouped together and the width of the existing edge is increased

- Node size scales logarithmically with its degree

- Nodes (Actors) are grouped together by their common movies. This one is a bit tricky, but basically if two nodes are in the same movie, we create invisible "pseudo" edges between them so that they are attracted to eachother. This results in the nice grouping by movie around an actor (otherwise, it would all be random)

# Learnings

This isn't a huge surprise, but LLMs work best when you already know what you want to do. For example, it really did speed up my FE + BE development since I knew exactly what I wanted to do, and could tell at a glance when it gave me good advice or BS.

On the other hand, I struggled with the production deployment. Even though it really isn't difficult to set up NGINX, I just didn't know how to set up a VM in general and the LLM (I used chatGPT mainly) often led me down the wrong paths. After a bit of research I realized all I needed was to set up NGINX + certbot directly on my VM, and have a simple config that proxied either to my backend (/api/) or frontend.
