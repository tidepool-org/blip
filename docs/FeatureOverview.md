## Overview of features

Blip is a web app for people with type 1 diabetes (PwDs) and their care teams. There are four main areas of functionality provided by the app:

- signing up for a Tidepool platform account, which includes:
    + verifying the sign-up e-mail address
    + accepting Tidepool's Terms of Use and Privacy Policy
    + setting up a "data storage account" (DSA)
- adding & updating user profile information
- editing & updating account settings (e-mail address & password)
- viewing diabetes device data & notes + adding or responding to notes.
    + The data is presented across these four main views:
        + Basics
            + This view contains a general summary of all of the user-uploaded device data available, including BG Readings and Distribution, Infusion Site Changes, Basal Events, and Bolus Events.
        + Daily
            + This view contains charts showing all of available device data and notes for a given day, and summaries such as Basal:Bolus ratios, Time In Target stats, and average BG for this period of time.
        + BG Log
            + This view contains a plot of all available BG readings for a given 2 week span, and summaries such as Basal:Bolus ratios, Time In Target stats, and average BG for this period of time.
        + Trends
            + This view allows users to analyze their BGM or CGM trends over a 1, 2, or 4 week period of time.
    + The default view presented to the user upon logging in or refreshing to show newly-loaded data is based on the type of data that was most recently uploaded. The determining criteria are as follows:
        + If the latest data is from a continuous glucose meter (cgm), the user will be directed to the __Trends__ view with CGM data showing.
        + If the latest data is from a manual blood-glucose meter (bgm), the user will be directed to the __BG Log__ view.
        + If the latest data is from an insulin pump (such as basal, bolux, wizard, or cgm data uploaded from the pump), the user will be directed to the __Basics__ view.


Hint: reading through the [state tree glossary](./StateTreeGlossary.md) (especially the [actions and working section](./StateTreeGlossary.md#actions-and-working)) should yield a pretty thorough overview of all the actions available to a user in blip, since we track the status of actions (at least those requiring communication with Tidepool's servers) in the state tree.
