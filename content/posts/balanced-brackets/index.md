---
title: "Tech Interview Question: Balanced Brackets"
date: 2022-10-10T10:44:22-04:00
draft: true
---

This is the first in a series of posts on technical questions I've been asked during interviews for software engineering internships. I've done dozens as part of UWaterloo's co-op system, and I'll be picking the most interesting to share with tips on solving them!

<!--more-->

## Problem

Imagine you had a string consisting of 3 different types of brackets. They are:
```
{}, [], ()
```
Your task is to write an algorithm to determine if the string is "balanced": That is, does every opening bracket correspond to a closing bracket *at the same depth*.
Some examples:
```
({[]}), ()[]     :white_check_mark:
```
```
([)], ]          :x:
```

## Step 1:  Clarifying Questions & Edge Cases

Altough this question is straightforward, many companies purposely do not give enough information in order to see how you ask questions. The obvious question here is "what about an empty string"? We assume that the empty string is balanced.

Now considering edge cases. We can keep these in our back pocket to reference once we come up with an algorithm. Some obvious edge cases are the empty string and only opening/closing brackets (you'll see why).

## Step 2: Data Structures that may help

The interviewer is expecting you to pick the best "tool" for this sort of problem.  We can look at the requirements to pick up clues for what will work. We can see there is a recursive structure to these bracket strings, and we see that the first closing we run into must have a matching opening directly preceeding it. Suppose we then remove this opening/closing pair. The next closing must *also* come directly after a matching opening. Hmmm...

What we've described sounds an awful lot like **push** and **pop** operations on a **stack**. This will be our tool of choice.

## Step 3: Algorithm

Expanding on our idea, we could **push** all opening brackets we see. When we run into a closing bracket, we can check the top of the stack to see if the most recent opening bracket matches. If so, **pop** it and continue. If not, it must be unbalanced.

Thinking about the edge case of only opening brackets, it will leave us with a non-empty stack. So, we need to check that the stack is empty before we finish.

Just as a note, you should be talking through all of this with your interviewer. I like to jot down some bullets in code comments as I go, to help stop me from talking in circles (which can happen if you're nervous).

## Step 4: Code
I like Go so that's what I use. We implement a stack as a slice of runes, append()'ing to push and changing indices to pop. We also have **bracketMap** to help us check if a bracket is opening or closing, and what it should correspond to.
Finally, one little detail is that we must double check the stack isn't empty before we try to pop.

```Go
package balanced

import "fmt"

func main() {
    input := "{{()}[]}"

    stack := make([]rune,0)
    bracketMap := map[rune]rune{
        '}':'{',
        ']':'[',
        ')':'(',
    }

    for _, c := range input {
        if isOpening(c, bracketMap) {
            stack = append(stack, c)
        } else {
            if len(stack) == 0 {
                fmt.Println("empty stack - unbalanced")
                return
            } 
            if bracketMap[c] != stack[len(stack) - 1] {
                fmt.Println("wrong bracket found - unbalanced")
                return
            }
            stack = stack[:len(stack) - 1]
        }
    }

    if len(stack) != 0 {
        fmt.Println("non-empty stack - unbalanced")
        return
    }
    fmt.Prinltn("Balanced!")
}

func isOpening(c rune, bracketMap map[rune]rune) bool {
    for _, val := range bracketMap {
        if val == c {
            return true
        }
    }
    return false
}
```

## Extensions

Usually, if you've done well the interviewer will ask about an extension to what you've written. I'll jot some down here with the answers I gave, try it yourself!
 - Support new types of brackets/characters
    - add them to bracketMap
 - Take input strings with garbage characters to ignore
    - add an **isClosing** function along with isOpening. Simply ignore if neither of these two functions fire.
 - Multi-character opening/closing tokens
    - Now we can have tokens like **\<p\>** but also **<>**
    - I said this reminded me of a compilers course, where our valid tokens can be represented by a deterministic finite automaton (DFA)
    - We can parse our input using a maximal much-like algorithm to get our tokens
    - Will this have to change our bracketMap?