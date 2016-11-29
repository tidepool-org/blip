## "Fake child accounts"

The phrase "fake child accounts" gets thrown around at Tidepool quite frequently, but it's not the most transparent term. So what is a fake child account?

A "fake child account" is a *single* Tidepool user account with data storage set up where the user signing up (for simplicity, we'll call this person the "parent," although it could be another type of caregiver or guardian) chose the radio option "This is for someone I care for who has type 1 diabetes" *instead of* "This is for me, I have type 1 diabetes".

When the "parent" sets up data storage for their "child" in this way, only **one** Tidepool account is created, and it is for this reason that we call it a "fake child account"—that is, because there isn't a parent account and a child account created (with a linkage between the two), but just one single account that has only one user ID and some special properties.

The user information in a normal Tidepool data storage account has the following shape (at a minimum):

```json
{
  "fullName": "Jane Doe",
  "patient": {
    "birthday": "1980-03-15",
    "diagnosisDate": "1999-12-25"
  }
}
```

In contrast, the user information in a "fake child account" has the shape below. Note the `isOtherPerson` Boolean property and additional embedded `fullName` property inside the `patient` object in particular:

```json
{
  "fullName": "Angie Bowie",
  "patient": {
    "birthday": "1971-05-30",
    "diagnosisDate": "2000-01-01",
    "isOtherPerson": true,
    "fullName": "Zowie Bowie"
  }
}
```
