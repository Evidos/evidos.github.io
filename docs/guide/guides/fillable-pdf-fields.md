---
title: Form Fields in PDFs
---

This guide explains how to create transactions with form fields that signers can fill in during the signing process. There are two different approaches available, each suited to different use cases.

### Overview

Form fields allow signers to provide additional information (such as addresses, phone numbers, or checkboxes) while signing documents. This is useful for:

- **Collecting Additional Information**: Gather specific data like addresses, phone numbers, or other personal details
- **Interactive Forms**: Create guided forms that lead signers through the information collection process
- **Dynamic Content**: Allow signers to enter content that varies from one signer to another
- **Signature Placement**: Position signature fields precisely where needed on the document

### Two Approaches

Signhost offers two methods for adding form fields to PDFs:

#### Approach 1: PDF-Embedded Form Fields

Use this when you have a PDF that already contains form fields created in a PDF editor (like Adobe Acrobat).

**Best for:**

- Pre-designed forms with complex layouts
- Reusing existing form templates
- When you have control over PDF creation

**Requirements:**

- PDF must have embedded form fields (text boxes, checkboxes)
- Contact [support@signhost.com](mailto:support@signhost.com?subject=PDF%20and%20formfields) for assistance creating PDFs with form fields

**Limitations:**

- Requires PDF preparation in advance
- Limited to text fields and checkboxes

#### Approach 2: API-Generated Form Fields

Use this when you want to add form fields to any PDF dynamically via the Signhost API.

**Best for:**

- Adding fields to existing PDFs without modification
- Dynamic field placement based on your application logic
- Programmatically positioning signatures and form fields
- Supporting multiple signers with different field sets

**Requirements:**

- Any PDF document (no special preparation needed)
- Knowledge of where to place fields (coordinates or text-based positioning)

**Advantages:**

- Works with any PDF
- Supports signatures, text fields, and checkboxes
- More flexible field positioning options
- Can be completely automated

### Comparison Table

| Feature               | PDF-Embedded Fields    | API-Generated Fields               |
| --------------------- | ---------------------- | ---------------------------------- |
| PDF Preparation       | Required               | Not required                       |
| Supported Field Types | Text boxes, checkboxes | Text boxes, checkboxes, signatures |
| Field Positioning     | Fixed in PDF           | Defined via API coordinates        |
| Setup Complexity      | Requires PDF editor    | Requires coordinate calculation    |
| Flexibility           | Limited to PDF design  | Highly flexible                    |
| Best Use Case         | Pre-designed forms     | Dynamic form generation            |

---

## Approach 1: PDF-Embedded Form Fields

This approach uses form fields that are already embedded in your PDF document.

### Steps for PDF-Embedded Fields

1. **Create a transaction**: This will initialize a new transaction and return a `transactionId`.

   [`POST /api/transaction/`](../../openapi/transactions/createTransaction.md)

2. **Add file metadata**: Upload JSON metadata that specifies which signer can fill which form fields.

   [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md) (with JSON content)

3. **Add the PDF file**: Upload the actual PDF document with fillable form fields.

   [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md) (with PDF content)

4. **Start the transaction**: Once all files are uploaded, start the transaction to notify the signers.

   [`PUT /api/transaction/:transactionId/start`](../../openapi/transactions/startTransaction.md)

#### 1. Create a Transaction

<!-- Add the API call to create a transaction -->

First, create a new transaction with the [`POST /api/transaction/`](../../openapi/transactions/createTransaction.md) endpoint that will contain your fillable PDF document. This will return a `transactionId` that you will use in subsequent requests.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
        "Signers": [{
          "Email": "john.doe@email.com",
          "Language": "en-US",
          "SendSignRequest": true,
          "SignRequestSubject": "Signature request",
          "SignRequestMessage": "Hi John, \n \n Please sign the document using the link below. \n \n Kind regards, \n \n Paul",
          "SendSignConfirmation": true,
          "DaysToRemind": 14,
          "Verifications": [
            {
              "Type": "Scribble",
              "RequireHandsignature": true,
              "ScribbleName": "John Doe"
            }
          ]
        }],
        "SendEmailNotifications": true
      }' \
  https://api.signhost.com/api/transaction/
```

You should receive a response with the transaction details, including the `Id` which is your `transactionId`:

```json
{
  "Id": "b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57",
  "Status": 5,
  "Signers": [
    {
      "Id": "Signer1",
      "Email": "john.doe@email.com",
      "Verifications": [
        {
          "Type": "Scribble",
          "RequireHandsignature": true,
          "ScribbleNameFixed": false,
          "ScribbleName": "John Doe"
        }
      ],
      "SendSignRequest": true,
      "SendSignConfirmation": true,
      "SignRequestSubject": "Signature request",
      "SignRequestMessage": "Hi John, \n \n Please sign the document using the link below. \n \n Kind regards, \n \n Paul",
      "DaysToRemind": 14,
      "Language": "en-US",
      "ScribbleName": "John Doe"
    }
  ]
}
```

The `Id` field contains your `transactionId` which you'll need for the following steps.

#### 2. Add File Metadata

Before uploading the actual PDF, you need to specify which signer can fill which form fields by uploading JSON metadata with the [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md) endpoint.

**Parameters:**

- `transactionId`: The ID from the transaction you just created
- `fileId`: A unique identifier for your document (e.g., "Contract.pdf")
- `Content-Type`: Must be `application/json` for metadata

**Metadata Structure:**

```json
{
  "DisplayName": "Your personal contract",
  "Signers": {
    "Signer1": {
      "FormSets": ["Contract.pdf"]
    }
  }
}
```

The `FormSets` array should contain the `fileId` of the document that contains the fillable fields.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -X PUT \
  -d '{
    "DisplayName": "Your personal contract",
    "Signers": {
      "Signer1": {
        "FormSets": ["Contract.pdf"]
      }
    }
  }' \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract.pdf
```

The response will indicate that the system is now awaiting the PDF document.

#### 3. Add the PDF File

Now upload the actual PDF document containing the fillable form fields using the [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md) endpoint.

**Parameters:**

- `transactionId`: The ID from the transaction
- `fileId`: The same identifier used in the metadata step
- `Content-Type`: Must be `application/pdf` for PDF files

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  -X PUT \
  -T Contract.pdf \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract.pdf
```

This uploads the `Contract.pdf` file to the transaction. The file must contain fillable form fields that match the configuration in your metadata.

#### 4. Start the Transaction

Once both the metadata and PDF file are uploaded, start the transaction with the [`PUT /api/transaction/:transactionId/start`](../../openapi/transactions/startTransaction.md) endpoint to notify the signers that they can now view, fill in the form fields, and sign the document.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -X PUT \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/start
```

This will start the transaction and send notifications to the signers that they can now view, fill in the form fields, and sign the document.

### Retrieving Form Field Data

When a signer completes the form fields and signs the document, you'll receive the filled-in data through postbacks (webhooks) or by retrieving the transaction details.

#### Postback

The completed form field data will be included in the `Context` property of each signer:

```json
{
  "Id": "b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57",
  "Status": 30,
  "Signers": [
    {
      "Email": "john.doe@email.com",
      "RequireScribble": true,
      "SendSignRequest": true,
      "SignRequestMessage": "Hello, could you please sign this document and fill in the required fields? Best regards, John Doe",
      "DaysToRemind": 15,
      "ScribbleName": "John Doe",
      "ScribbleNameFixed": false,
      "Context": {
        "Contract.pdf": {
          "addressline1": "123 Main Street",
          "addressline2": "Apartment 4B",
          "city": "Amsterdam",
          "postalcode": "1012 AB",
          "country": "Netherlands"
        }
      }
    }
  ]
}
```

#### API

You can also retrieve the form field data by calling the [Get Transaction](../../openapi/transactions/getTransaction.md) endpoint:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57
```

---

## Approach 2: API-Generated Form Fields

This approach allows you to dynamically create form fields on any PDF document through the API, without requiring the PDF to have pre-existing form fields.

### Steps for API-Generated Fields

#### 1. Create a Transaction

First, create a new transaction using the [`POST /api/transaction/`](../../openapi/transactions/createTransaction.md) endpoint.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
        "Signers": [{
          "Email": "john.doe@email.com",
          "Language": "en-US",
          "SendSignRequest": true,
          "SignRequestSubject": "Signature request",
          "SignRequestMessage": "Hi John, \n \n Please sign the document using the link below. \n \n Kind regards, \n \n Paul",
          "SendSignConfirmation": true,
          "DaysToRemind": 14,
          "Verifications": [
            {
              "Type": "Scribble",
              "RequireHandsignature": true,
              "ScribbleName": "John Doe"
            }
          ]
        }],
        "SendEmailNotifications": true
      }' \
  https://api.signhost.com/api/transaction/
```

You should receive a response with the transaction details:

```json
{
  "Id": "b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57",
  "Status": 5,
  "Signers": [
    {
      "Id": "Signer1",
      "Email": "john.doe@email.com",
      ...
    }
  ]
}
```

Note the following fields from the response:

- `b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57` This is your `transactionId` which you will use in subsequent requests.
- `Signer1` This is your `signerId` which you will use in the metadata step.

#### 2. Add File Metadata with Form Sets

Upload JSON metadata that defines the form fields and their locations using the [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md) endpoint.

**Parameters:**

- `transactionId`: The ID from the transaction you just created
- `fileId`: A unique identifier for your document (e.g., "Contract.pdf")
- `Content-Type`: Must be `application/json` for metadata

**Form Sets Structure:**

The `FormSets` object in the metadata defines the fields and their locations. Each Form Set can contain multiple fields with different types:

- **Signature**: A field where the signer places their signature
- **SingleLine**: A single-line text input field
- **Check**: A checkbox field

**Field Positioning:**

You can position fields using coordinates:

- `Right`: Distance from the left edge of the page (in points)
- `Top`: Distance from the top edge of the page (in points)
- `Width`: Width of the field (in points)
- `Height`: Height of the field (in points)
- `PageNumber`: The page number where the field should appear (1-based)

**Note:** It is recommended to use a width of 140 and a height of 70 for signature fields.

Example with multiple field types:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -X PUT \
  -d '{
        "DisplayName": "Your personal contract",
        "Signers": {
          "Signer1": {
            "FormSets": ["SampleFormset"]
          }
        },
        "FormSets": {
          "SampleFormset": {
            "SignatureOne": {
              "Type": "Signature",
              "Location": {
                "Right": 10,
                "Top": 10,
                "PageNumber": 1,
                "Width": 140,
                "Height": 70
              }
            },
            "AddressLine1": {
              "Type": "SingleLine",
              "Location": {
                "Right": 50,
                "Top": 100,
                "PageNumber": 1,
                "Width": 200,
                "Height": 20
              }
            },
            "AddressLine2": {
              "Type": "SingleLine",
              "Location": {
                "Right": 50,
                "Top": 130,
                "PageNumber": 1,
                "Width": 200,
                "Height": 20
              }
            },
            "AgreeToTerms": {
              "Type": "Check",
              "Location": {
                "Right": 50,
                "Top": 160,
                "PageNumber": 1,
                "Width": 15,
                "Height": 15
              }
            }
          }
        }
      }' \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract.pdf
```

**Important Notes:**

- The `FormSets` array in the `Signers` section should reference one or more keys in the `FormSets` dictionary
- A Form Set should be unique within a transaction
- If you provide a duplicate Form Set key, the old one will be overwritten with the new one
- For more information about Form Sets, see the [Form Sets guide](../features/formsets.md)

#### 3. Add the PDF File

Upload the actual PDF document using the [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md) endpoint.

**Parameters:**

- `transactionId`: The ID from the transaction
- `fileId`: The same identifier used in the metadata step
- `Content-Type`: Must be `application/pdf` for PDF files

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  -X PUT \
  -T Contract.pdf \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract.pdf
```

#### 4. Start the Transaction

Start the transaction using the [`PUT /api/transaction/:transactionId/start`](../../openapi/transactions/startTransaction.md) endpoint.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -X PUT \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/start
```

---

## Retrieving Form Field Data

Regardless of which approach you use, retrieving the completed form field data works the same way.

### Via Postback

When a signer completes the form fields and signs the document, you'll receive the filled-in data through postbacks (webhooks). The completed form field data will be included in the `Context` property of each signer:

```json
{
  "Id": "b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57",
  "Status": 30,
  "Signers": [
    {
      "Email": "john.doe@email.com",
      "RequireScribble": true,
      "SendSignRequest": true,
      "SignRequestMessage": "Hello, could you please sign this document and fill in the required fields? Best regards, John Doe",
      "DaysToRemind": 15,
      "ScribbleName": "John Doe",
      "ScribbleNameFixed": false,
      "Context": {
        "Contract.pdf": {
          "addressline1": "123 Main Street",
          "addressline2": "Apartment 4B",
          "city": "Amsterdam",
          "postalcode": "1012 AB",
          "country": "Netherlands"
        }
      }
    }
  ]
}
```

### Via API

You can also retrieve the form field data by calling the [Get Transaction](../../openapi/transactions/getTransaction.md) endpoint:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57
```

---

## Prerequisites

You will need:

- An APP key and User Token to authenticate your requests
- For **PDF-Embedded Fields**: A PDF document with embedded form fields (contact [support@signhost.com](mailto:support@signhost.com?subject=PDF%20and%20formfields) for assistance)
- For **API-Generated Fields**: Any PDF document and knowledge of where to place fields

See the [Authentication guide](../features/authentication.md) for more details on how to obtain authentication tokens.

## Supported Form Field Types

Both PDF-Embedded and API-Generated approaches support the following field types:

| Field Type                | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| Text fields (single line) | Allow signers to enter text information                      |
| Checkboxes                | Allow signers to select or deselect options                  |
| Signatures                | Allow signers to place their signature at specific locations |

## Best Practices

1. **Choose the right approach**: Use PDF-Embedded fields for pre-designed forms with complex layouts, and API-Generated fields for dynamic scenarios or when you need to add fields to existing PDFs.

2. **Test thoroughly**: Test your implementation in a development environment, especially when working with coordinate-based positioning.

3. **Clear field names**: Use descriptive names for your form fields that clearly indicate what information is expected.

4. **Validate data**: Always validate the form field data you receive through postbacks or API calls.

5. **Handle errors gracefully**: Implement proper error handling for cases where form fields are not filled correctly or coordinates are invalid.

6. **User guidance**: Provide clear instructions to signers about what information is required in each field.

7. **Signature field sizing**: When using API-Generated fields, use the recommended dimensions of 140x70 points for signature fields.

8. **Coordinate calculation**: For API-Generated fields, carefully calculate coordinates. Consider using test PDFs to verify field positioning before production use.

## Conclusion

You now understand both approaches for creating transactions with form fields using the Signhost API:

- **PDF-Embedded Fields**: Best for pre-designed forms with existing field definitions
- **API-Generated Fields**: Best for dynamic field placement and working with any PDF

Both approaches allow signers to fill in required information during the signing process, and you'll receive the completed data through postbacks or by retrieving transaction details.

For more information:

- [Postbacks guide](../features/postbacks.md) - Learn about webhooks and status updates
- [Form Sets guide](../features/formsets.md) - Detailed information about Form Sets
- [API Reference](../../openapi/index.md) - Complete API documentation
