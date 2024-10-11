/**
 * @generated SignedSource<<5c8d927475f5ac2ddd05a0c07c6c5b2b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelConfigButtonDialogQuery$variables = Record<PropertyKey, never>;
export type ModelConfigButtonDialogQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ModelPickerFragment">;
};
export type ModelConfigButtonDialogQuery = {
  response: ModelConfigButtonDialogQuery$data;
  variables: ModelConfigButtonDialogQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ModelConfigButtonDialogQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ModelPickerFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ModelConfigButtonDialogQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Literal",
            "name": "vendors",
            "value": [
              "OpenAI",
              "Anthropic"
            ]
          }
        ],
        "concreteType": "ModelProvider",
        "kind": "LinkedField",
        "name": "modelProviders",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "modelNames",
            "storageKey": null
          }
        ],
        "storageKey": "modelProviders(vendors:[\"OpenAI\",\"Anthropic\"])"
      }
    ]
  },
  "params": {
    "cacheID": "cf6e53f2293c51d168b08e5d2fc7b391",
    "id": null,
    "metadata": {},
    "name": "ModelConfigButtonDialogQuery",
    "operationKind": "query",
    "text": "query ModelConfigButtonDialogQuery {\n  ...ModelPickerFragment\n}\n\nfragment ModelPickerFragment on Query {\n  modelProviders(vendors: [\"OpenAI\", \"Anthropic\"]) {\n    name\n    modelNames\n  }\n}\n"
  }
};

(node as any).hash = "98dc1b22aa68897365be9b248625fc1d";

export default node;