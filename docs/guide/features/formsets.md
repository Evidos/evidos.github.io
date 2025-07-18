---
title: Form Sets
---

Form Sets allow you to define multiple collections of form fields that can be assigned to different signers in a transaction. This feature enables you to collect different information from different signers, create reusable field definitions, and build complex multi-signer workflows.

### Overview

Form Sets are particularly useful when you need to:

- Collect different types of information from different signers
- Create reusable field templates for common document types
- Build complex multi-signer workflows with role-based field assignments
- Maintain consistency across similar transactions

### How Form Sets Work

Form Sets are collections of form fields that can be assigned to specific signers. The workflow involves:

1. **Define Form Sets**: Create named collections of fields with specific types and locations
2. **Assign to Signers**: Link Form Sets to specific signers using their signer IDs
3. **Position Fields**: Specify where each field should appear on the PDF document
4. **Collect Data**: Retrieve filled-in data when the transaction is completed

### Key Concepts

- **Form Set Names**: Each Form Set must have a unique name within the **entire transaction** (not just per document). This applies across all documents if you have a multi-document transaction.
- **Signer Assignment**: Use the signer's ID to assign Form Sets to specific signers
- **Field Definitions**: Each field within a Form Set has a type, location, and optional properties
- **Reusability**: Form Sets can be reused across multiple transactions with similar requirements

### Supported Field Types

| Type         | Description                           | Notes                                      | Use Case                        |
| ------------ | ------------------------------------- | ------------------------------------------ | ------------------------------- |
| `Signature`  | Create a signature field for a signer | Recommended: Width: 140, Height: 70        | Legal signatures, approvals     |
| `SingleLine` | Create a single line text input field |                                            | Names, addresses, phone numbers |
| `Check`      | Create a checkbox                     | `Value`: The checked value of the checkbox | Agreements, confirmations       |
| `Seal`       | Create a seal signature               | _Not yet implemented_                      | Official document sealing       |

#### Field Type Examples

**Signature Field:**

```json
{
  "SignatureField": {
    "Type": "Signature",
    "Location": {
      "Search": "{{Signer1}}",
      "Width": 140,
      "Height": 70
    }
  }
}
```

**Text Input Field:**

```json
{
  "FullName": {
    "Type": "SingleLine",
    "Location": {
      "Search": "Full Name:",
      "Left": 10,
      "Width": 200
    }
  }
}
```

**Checkbox Example:**

```json
{
  "UserAgrees": {
    "Type": "Check",
    "Value": "I agree to the terms and conditions",
    "Location": {
      "Search": "user_agree",
      "Left": 5
    }
  }
}
```

### Field Location Options

The `Location` object determines where the field should be placed on the PDF document:

| Property     | Type    | Description                                                         | Example       |
| ------------ | ------- | ------------------------------------------------------------------- | ------------- |
| `Search`     | String  | Text to search in the PDF document to use as the position reference | `{{Signer1}}` |
| `Occurrence` | Integer | When using text search, match only this specific occurrence         | `1`           |
| `Top`        | Integer | Offset from the top of the search text or page (in pixels)          | `10`          |
| `Right`      | Integer | Offset from the right of the search text or page (in pixels)        | `20`          |
| `Bottom`     | Integer | Offset from the bottom of the search text or page (in pixels)       | `30`          |
| `Left`       | Integer | Offset from the left of the search text or page (in pixels)         | `40`          |
| `Width`      | Integer | The width of the field (cannot be used with both Left and Right)    | `200`         |
| `Height`     | Integer | The height of the field (cannot be used with both Bottom and Top)   | `30`          |
| `PageNumber` | Integer | The number of the page the field should be placed                   | `1`           |

:::tip Coordinate System

All measurements are in points (1/72 inch)

:::

### Location Examples

#### Search-based positioning:

Position a field relative to specific text in the document:

```json
{
  "Location": {
    "Search": "{{Signer1}}",
    "Left": 10,
    "Top": 5
  }
}
```

#### Absolute positioning:

Place a field at a specific location on the page:

```json
{
  "Location": {
    "PageNumber": 1,
    "Top": 100,
    "Left": 50,
    "Width": 200,
    "Height": 30
  }
}
```

::: info
You must specify a page number when not using the `Search` property.
:::

#### Simple search positioning:

Let the system automatically position the field at the search text:

```json
{
  "Location": {
    "Search": "Sign here"
  }
}
```

#### Multiple occurrences:

Position at the second occurrence of specific text:

```json
{
  "Location": {
    "Search": "Date:",
    "Occurrence": 2,
    "Left": 10
  }
}
```

### Complete Form Set Example

Here's a comprehensive example showing how to create Form Sets for multiple signers:

```json
{
  "DisplayName": "Employment Contract",
  "Signers": {
    "employee-signer-id": {
      "FormSets": ["EmployeeDetails", "EmployeeSignature"]
    },
    "manager-signer-id": {
      "FormSets": ["ManagerApproval"]
    },
    "hr-signer-id": {
      "FormSets": ["HRProcessing"]
    }
  },
  "FormSets": {
    "EmployeeDetails": {
      "FullName": {
        "Type": "SingleLine",
        "Location": {
          "Search": "Employee Name:",
          "Left": 10,
          "Width": 200
        }
      },
      "StartDate": {
        "Type": "SingleLine",
        "Location": {
          "Search": "Start Date:",
          "Left": 10,
          "Width": 100
        }
      },
      "EmergencyContact": {
        "Type": "SingleLine",
        "Location": {
          "Search": "Emergency Contact:",
          "Left": 10,
          "Width": 200
        }
      }
    },
    "EmployeeSignature": {
      "EmployeeSign": {
        "Type": "Signature",
        "Location": {
          "Search": "Employee Signature:",
          "Left": 10,
          "Width": 140,
          "Height": 70
        }
      }
    },
    "ManagerApproval": {
      "ManagerApproves": {
        "Type": "Check",
        "Value": "Approved",
        "Location": {
          "Search": "Manager Approval:",
          "Left": 10
        }
      },
      "ManagerSign": {
        "Type": "Signature",
        "Location": {
          "Search": "Manager Signature:",
          "Left": 10,
          "Width": 140,
          "Height": 70
        }
      }
    },
    "HRProcessing": {
      "ProcessingDate": {
        "Type": "SingleLine",
        "Location": {
          "Search": "Processing Date:",
          "Left": 10,
          "Width": 100
        }
      },
      "HRSign": {
        "Type": "Signature",
        "Location": {
          "Search": "HR Signature:",
          "Left": 10,
          "Width": 140,
          "Height": 70
        }
      }
    }
  }
}
```

### Best Practices

1. **Signature Field Dimensions**: Use Width: 140 and Height: 70 for signature fields to ensure adequate space
2. **Signature Fields for All Signers**: If you specify a signature field location for one signer, you must specify signature field locations for **all** signers in the transaction. Omitting signature fields for some signers while defining them for others can result in signatures not being placed correctly.
3. **Unique Form Set Names**: Ensure each Form Set has a unique name within the **entire transaction** (across all documents) to avoid conflicts. Form Set names must be unique at the transaction level, not just per document.
4. **Test Field Positions**: Test your field positioning with sample PDFs before production deployment
5. **Clear Search Text**: Use distinctive text for search-based positioning that won't match unintended locations
6. **Fallback Positioning**: Consider using absolute positioning for critical fields if search text might be unreliable
7. **Logical Grouping**: Group related fields into the same Form Set for better organization
8. **Descriptive Field Names**: Use clear, descriptive names for fields to make data retrieval easier
9. **Consistent Spacing**: Maintain consistent spacing between fields for a professional appearance
10. **Page Boundaries**: Ensure fields don't extend beyond page boundaries
11. **Mobile Compatibility**: Consider how fields will appear on mobile devices during signing

### Common Use Cases

#### Contract Signing

- **Employee Form Set**: Personal details, emergency contact, signature
- **Manager Form Set**: Approval checkbox, signature
- **HR Form Set**: Processing notes, signature

#### Invoice Approval

- **Requester Form Set**: Description, amount, signature
- **Approver Form Set**: Approval checkbox, comments, signature
- **Finance Form Set**: Account codes, signature

#### Multi-Party Agreements

- **Party A Form Set**: Contact details, terms acceptance, signature
- **Party B Form Set**: Contact details, terms acceptance, signature
- **Witness Form Set**: Witness information, signature

### Troubleshooting

**Field Not Appearing:**

- Check that the search text exists in the PDF
- Verify field dimensions fit within the page boundaries
- Ensure the Form Set is assigned to the correct signer

**Field Positioning Issues:**

- Test with absolute positioning first
- Check for multiple occurrences of search text
- Verify coordinate calculations

**Data Not Captured:**

- Ensure field names are unique within the Form Set
- Check that the signer completed all required fields
- Verify the transaction reached completion

### Related Guides

- [Form Fields in PDFs](../guides/fillable-pdf-fields.md): Complete guide covering both PDF-embedded and API-generated form fields
- [Multi-document Transactions](../guides/multidocument-transaction.md): Working with multiple documents
