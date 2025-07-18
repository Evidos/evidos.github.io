---
title: Signature Location
---

We provide three ways to specify the location for the signatures.

### 1. Signer tags in PDF

You can specify the signature location in the PDF document. When you create the PDF that needs to be signed you can include the tag `{{Signer1}}`, `{{Signer2}}`, etc. at the location you want the signature displayed.

If you do not want to show a `{{Signer}}` tag in your document you can give the tag the background colour of your document, in general this is the colour white.

Although PDF is a document standard we strongly recommend to test the signer location and `{{Signer}}` tag to see if the location is correct. If you do not include the `{{Signer}}` tag, or you do not use another way to specify the location, we will use the default signing location: top right on the first page.

:::warning
Please be aware that including a lot of `{{Signer}}` tags will have an impact on the performance and signature validation process. For a digital signature we do not recommend to include a signature on every page.
:::

### 2. Upload JSON metadata

A second method of specifying the signature location is by uploading a JSON metadata file after creating the transaction. For this method you do not need to prepare the PDF file in any way. The flow of making a transaction is basically the same as before, although this time you need to add file metadata to the transaction before uploading the file(s).

For more information about this method please take a further look at: [Form Fields in PDFs - Approach 2: API-Generated Form Fields](../guides/fillable-pdf-fields.md#approach-2-api-generated-form-fields).

### 3. Signature fields

The third way of specifying the signature location is to make use of PDF Signature fields.

::: warning
This method is not recommended as it requires external PDF tools.
:::

To make sure that the signature fields are recognized they have to be named following a specific pattern: `Signature-x_y`. Where the `x` stands for the signer and the `y` for the signature number.

For example: `Signature-1_2` will specify the placement for the second signature of the first signer.
