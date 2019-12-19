---
layout: page
title: Designing the webform
permalink: forms/design/
product: Forms
---

Evidos will define the webform and fields together with the customer.
During the design the different steps in the form can be defined.
Also specific form validations, required/non required fields are defined.
The webforms are responsive and mobile friendly.

## Branding

The form can be branded in the style and look and feel of the customer.
There are two ways to present the webform:
1. By including a javascript library and a javascript include in the website of the customer.
2. A dedicated form on Evidos Forms, optionally with a custom website domain (for example: ```https://mydomain.com/form``` )

To include a form you have to do the following:
1. If not included yet include JQuery library and JQuery UI with widgets functionality. (Recommended jQuery version is > 1.10.2.2)
2. Include our Forms library:
```html
<script src="https://formsengine.signhost.com/publisher/includeQuestionnaire.js" type="text/javascript"></script>
```
3. Initialize the form
```javascript
jQuery(function() {
    FormsEngine.initForm({
        id: "<forms_id>",
        containerId: "<div containter Id>",
        publisherUri: "https://formsengine.signhost.com/publisher",
    });
});
```

## Data validation
The following data field validation and enrichment is possible to include;

Identity check; within the form the user presents eID like iDIN or passport/selfie check;

Data enrichment; Additional data is prefilled using registers like address, chamber of commerce;

Registry check; Additional checks in a register like creditworthiness, Politically Exposed Person (PEP);

Data validation; Checking value entry, like IBAN check, phone check.
