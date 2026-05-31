# Broken LED Clock Problem

This repo presents a coding challenge that I developed myself in response to noticing that the digital LED clock display on my oven was broken:

![broken clock on my oven](image.jpg)

As you can see from the image, this challenge pertains to an LED clock which displays the time using four sets of numbers (two numbers to represent the hour and two numbers to represent the minutes). Each number is individually represented by 7 LEDs. 

All 7 LEDs are turned ON when the number 8 needs to be displayed. The names of these 7 LEDs can be described as follows:

- Top
- Top left
- Top right
- Middle
- Bottom left
- Bottom right
- Bottom

After I noticed that one of these LEDs had broken, I found myself wondering if the LED which broke was the LED which was most frequently used on the clock. This is the core question of the coding challenge.

To satisfy the challenge, you must generate a sorted list of all 28 LEDs with the associated number of minutes that each LED is turned ON within a 12-hour period, given the following additional rules:

- Military/European time is NOT used
- Leading zeroes on the hour display are not rendered

The accompanying TypeScript program depicts my first attempt at a solution.