---
title: "Dual Booting Archlinux and Windows"
date: 2023-09-24T19:12:36Z
tags: ['linux', 'software', 'project']
---

I recently got a new laptop: a refurbished Dell XPS 13 9315. Just like my previous XPS, I want to dual-boot so I can play steam games on Windows but do my development work in a linux environment. This article covers the steps specific to setting up dual-boot as well as hurdles I've run into.

<!--more-->

# Preface
This article is only meant to supplement the existing [archlinux installation guide](https://wiki.archlinux.org/title/installation_guide).

# Advice
Know what you're getting into. Although you don't have to be a linux expert, it can be difficult or frustrating getting a barebones distribution like Arch working as you'd expect. You're probably going to have to do some googling and debugging.

Try not to jump between guides/tutorials. There are so many, and they do different things for different reasons. Try and stick just with the [official one](https://wiki.archlinux.org/title/installation_guide).

# Required Items
A windows laptop and a USB stick.

# Step 0
Back up your data.

# Step 1
The first thing we're going to do is use the Windows Disk Management tools to de-allocate space that we'll use for Arch. 

Inside the disk managment tool, you'll be able to see your disk and all the partitions. Find the 'C' drive, right-click, and shrink the partition by however much space you'd like to give linux.

I've run into an issue where you're only able to shrink your partition by a tiny amount due to immovable files. See a potential fix [here](https://superuser.com/questions/1017764/how-can-i-shrink-a-windows-10-partition).

# Step 2
We're going to need to run software (like the linux iso) from the USB drive. In order to make bootable USB's, we'll use the free software [Rufus](https://rufus.ie/en/). There are other options on the [USB flash installation](https://wiki.archlinux.org/title/USB_flash_installation_medium) wiki page. Download and run the software.

# Step 3
Now we have to format that unallocated space into a system that linux understands. We will do this using [GParted](https://gparted.org/why-partition.php#multi-os), a free partition manager software. We have to use GParted since Windows is incapable of doing this. Here's a video for [reference](https://www.youtube.com/watch?v=vlVXPtJ20hA&ab_channel=eKiwi-BlogTutorialsEnglish).

Using rufus, burn the GParted iso to your USB drive. It's fine to use the defaults.

# Step 4
Let's boot into that USB. Spam f2 (or whichever button it is for you) to open BIOS and change the boot order.

While you're at it, <b>disable secure boot</b>. This is a feature enabled by default on most windows laptops. More details [here](https://wiki.archlinux.org/title/Dual_boot_with_Windows#UEFI_Secure_Boot).

Now you'll see the GRUB bootloader. You should be able to click the first option, opening with defaults. For some reason I kept getting a black screen, but I used the "safe grahics" option and it then worked fine. Continue picking the defaults until you reach the desktop.

The partition overview will automaticaly open. Right click the unallocated partition, click `new`, and set as `Primary Partition` with filesystem `ext4`. Give it a name if you'd like.

None of these changes are applied until you click the green checkmark, so do that. Then, restart and boot back into Windows.

Note: In the future, if you want more space, you'll follow a similar pattern of shrinking from inside Windows then editing the size of your linux partition from inside GParted.

# Step 5
Now we're going to install arch. [Download the iso](https://archlinux.org/download/) and burn it to your USB with rufus. I used the waterloo csc mirrors hehe. You can use rufus to check the sha256 checksum.

From this point, boot from the USB and follow the [installation guide](https://wiki.archlinux.org/title/installation_guide). It's also a good idea to read the [Dual Boot with Windows](https://wiki.archlinux.org/title/Dual_boot_with_Windows#UEFI_Secure_Boot) wiki page. The remaining points are some very important "gotchas" I ran into while following this process.

# Useful Commands
`fdisk -l`: lists drives/partitions

`lsblk`: lists "block devices" ie. hard drives

`mount`: lists all mount points

`umount /mnt/X`: if you accidentally mount the wrong thing

# Gotcha 0 (not really a gotcha)
You can skip the formatting in section 1.1 since we already have both partitions. The EFI partition already exists and our unallocated space was formatted to ext4 with GParted. We have no swap space cuz lazy and 16gb of ram.

Note: I'm now thinking we probably could've skipped using GParted and just formatted using arch's tools like the install guide says. I'll try this next time!

# Gotcha 1 (EFI partition runs out of space)
From the [Dual Boot](https://wiki.archlinux.org/title/Dual_boot_with_Windows) wiki page:

```
Windows Setup creates a 100 MiB EFI system partition (except for Advanced Format 4K native drives where it creates a 300 MiB ESP), so multiple kernel usage is limited. Workarounds include:

Mount ESP to /efi and use a boot loader that has file system drivers and is capable of launching kernels that reside on other partitions.
Expand the EFI system partition, typically either by decreasing the Recovery partition size or moving the Windows partition (UUIDs will change).
Backup and delete unneeded fonts in esp/EFI/Microsoft/Boot/Fonts/ [2].
Backup and delete unneeded language directories in esp/EFI/Microsoft/Boot/ (e.g. to only keep en-US).
Use a higher, but slower, compression for the initramfs images. E.g. COMPRESSION="xz" with COMPRESSION_OPTIONS=(-9e).
```

Do the first workaround. I was impatient and missed this, so when attempting to install GRUB the EFI partition ran out of space. If you run into this, clear some space by deleting everything outside EFI as mentioned in this [reddit comment](https://www.reddit.com/r/archlinux/comments/flyd7l/unable_to_install_grub_onto_boot_no_space_left_on/).

ie. instead of 
```
# mount --mkdir /dev/efi_system_partition /mnt/boot
```
do
```
# mount --mkdir /dev/efi_system_partition /mnt/efi
```

# Gotcha 2 (Bootloader can't detect Windows)
Hopefully you can make it through the rest of the install guide with little issues. One caveat comes with detecting other operating systems. Be sure to read [section 3.1.2](https://wiki.archlinux.org/title/GRUB#Detecting_other_operating_systems) of the GRUB wiki page that explains how to use `os-prober`.

However, for whatever reason os-prober was unable to find Windows Boot Manager. I had my efi partition mounted properly to /mnt/efi, so I don't know what the issue was. In any case, I gave up and added the boot entry manually using [this](https://bbs.archlinux.org/viewtopic.php?id=271879) blog post as a guide. You add the following code to `/etc/grub.d/40_custom`:
```
menuentry 'Windows' {
   search --fs-uuid --set=root $uuid
   chainloader /EFI/Microsoft/Boot/bootmgfw.efi
}
```

Be sure to replace $uuid with the partition uuid (google how to do this).

# Conclusion
And that should be it! Now you can use GRUB to boot either Arch or Windows. Enjoy!