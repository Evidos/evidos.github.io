---
layout: page
title: Initiate Form URL
permalink: forms/initiate/
product: Forms
---

For the webform there is two possible scenario’s
1. Non prefilled form; this is a standard form that can be filled by any customer that receives the same link
2. Prefilled form; the form is prefilled with data from the customer system and the link is a personal link

To initiate a personalized form and retrieve the data, the link contains a unique non guessable id/token.
```https://mydomain.com/form/?id=<unique_non_guessable_id>```

Note: although the non-prefilled link does not prefill any personal information, it could be useful to link the final signed document to a certain customer file.
In this case it is possible to include a unique non guessable ID in the URL; ```https://mydomain.com/form/?id=<unique_non_guessable_id>```

## Authentication

When prefilled data is included it could be a requirement to let the enduser login before seeing the personal data.
This could minimize to risk to expose personal data to unauthorized persons.
Optionally it is possible to link the form to the authentication service of the customer.
Evidos Forms will then check if the entered credentials are valid using the customer system REST API.

## Retrieving the customerdata
When the enduser clicks on the formlink, Evidos Forms will get the prefilled data from the customer system using a Rest API service.
Evidos forms will use the unique non guessable ID within the Rest API to retrieve the data.
Evidos forms has several standard Rest API connections available, further specification of this (existing) customer API is specified within the project.

The mapping of the formfields and the customer datafields is done during the project and depends on the API specifications and required formfields.

**Note:** it is not required to show prefilled data as a formfield, this could also be hidden data for use in the customer system.

## Additional PDF attachments
In certain use cases the customer wants to include a default PDF, or generate PDF in the signing process.
For example when the customer configured a custom proposal from a product configuration system.
It is possible to get this PDF from the customer system.
In this case an additional REST API service must be available to retrieve the document.

## Errors/ non availability of customer webservice
For prefilled forms it could happen that the webservice of the customer is not available or the specific enduser record is not available.
This will result in a configured error message for the enduser, for example:
> Form is unavailable, try again later or contact your merchant

Endpoints of the webservice must be monitored by the customer.

## PDF documents
There are three types of PDF documents that can be included or used to be signed;
1. Default PDF without custom data, these documents can be added automatically and are configured in Evidos Forms;
2. Template PDF, the PDF template that can be filled with the formfields entered by the enduser;
3. Pre-generated PDF, a PDF document that is generated earlier in the journey, for example when the customer configured a custom proposal from a product configuration system. It is possible to get this PDF from the customer system. In this case an additional REST API service must be available to retrieve the document.

## User filling in the form
When the user clicks the URL the webform is opened.
The user fills in the details and one or more additional checks are performed.

If the data entry is not correct or results in not finishing the form, the user will be shown the error or mismatch.

No data is cached. If the user closes the form he is able to open the link again clicking on the link.

**Note:** The prefilled form URL is available as long as the data can be retrieved from the customer system.
Non-prefilled forms are available until the customer closes the webform by contacting Evidos.

## Form analytics
Customer can see the analytics of the forms by including their web analytics tools.