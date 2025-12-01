import {ODRL} from "../src";

async function main() {
    const policy: ODRL.Policy = {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@type": "Agreement",
        id: "http://example.com/policy:1010",
        "duc:provider": "http://oem.com/ids#me",
        permission: [
            {
                "duc:consumer": "http://supplier.com/",
                target: "http://oem.com/ids/inventory/dataset-1",
                action: "duc:train",
            }
        ],
        obligation: [
            {
                target: "http://oem.com/ids/inventory/dataset-1",
                action: "inform",
                consequence: [
                    {
                        target: "http://oem.com/ids/inventory/dataset-1",
                        action: [
                            {
                                "rdf:value": {"@id": "duc:KillJob"},
                                refinement: [
                                    {
                                        leftOperand: "recipient",
                                        operator: "eq",
                                        rightOperand: {
                                            "@value": "flinkid00",
                                            "@type": "http://orion.fiware.org/Job"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        prohibition: [
            {
                assignee: "http://supplier.com/",
                target: "http://oem.com/ids/inventory/dataset-1",
                action: "print"
            }
        ]
    }


}

main().catch(console.error);
