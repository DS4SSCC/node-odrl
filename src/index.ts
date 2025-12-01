/**
 * ODRL 2.2 TypeScript representation
 *
 * Based on:
 * - ODRL Information Model 2.2 (W3C Recommendation, 15 Feb 2018)
 *   https://www.w3.org/TR/odrl-model/
 * - ODRL Vocabulary & Expression 2.2
 *   https://www.w3.org/TR/odrl-vocab/
 */
export namespace ODRL {

    /**
     * An operation that can be performed on an Asset.
     * Actions are extensible via `includedIn` and `implies` relationships.
     * Common core actions include "use", "transfer", "play", "distribute", etc.
     * @see https://www.w3.org/TR/odrl-model/#action
     */
    export type Action = string | {
        /**
         * When an Action is refined, it must be wrapped with `rdf:value` pointing to its IRI.
         * Used primarily in JSON-LD serialization.
         */
        'rdf:value': { '@id': string };
        /**
         * Constraints that narrow the semantics of this Action.
         * @see https://www.w3.org/TR/odrl-model/#constraint
         */
        refinement?: Constraint | Constraint[];
    };

    /**
     * Constraints refine Rules, Actions, Assets, or Parties using boolean/logical expressions.
     * @see https://www.w3.org/TR/odrl-model/#constraint
     */
    export namespace Constraint {

        /**
         * Atomic (leaf) constraint comparing two operands with a relational operator.
         * @see https://www.w3.org/TR/odrl-model/#constraint-class
         */
        export type Atomic = {
            /**
             * The left operand (e.g., "dateTime", "count", "resolution").
             * Must be a defined LeftOperand term (often from ODRL Common Vocabulary).
             */
            leftOperand: string;
            /**
             * Relational operator.
             * Spec supports: eq, neq, gt, gteq, lt, lteq, and custom operators via profiles.
             */
            operator: 'eq' | 'neq' | 'gt' | 'gteq' | 'lt' | 'lteq' | string;
            /**
             * Literal value or IRI for the right operand.
             * Mutually exclusive with `rightOperandReference`.
             */
            rightOperand?: any;
            /**
             * IRI to be dereferenced to obtain the right operand value.
             * Only one of `rightOperand` or `rightOperandReference` may appear.
             */
            rightOperandReference?: string;
            /**
             * Data type of the operand (e.g., "xsd:dateTime", "xsd:integer").
             */
            dataType?: string;
            /**
             * Unit of measurement (e.g., currency, DPI, time).
             */
            unit?: string;
            /**
             * Runtime value generated from `leftOperand` (e.g., current count of usages).
             */
            status?: any;
            /**
             * Optional identifier for referencing this constraint elsewhere.
             */
            uid?: string;
        };

        /**
         * Composite constraint (logical grouping of constraints).
         * @see https://www.w3.org/TR/odrl-model/#logicalconstraint
         */
        export type Composite =
            | { and: (Atomic | Composite)[]; uid?: string }
            | { or: (Atomic | Composite)[]; uid?: string }
            | { xone: (Atomic | Composite)[]; uid?: string }
            | { andSequence: { '@list': (Atomic | Composite)[] }; uid?: string }
            | {
            // @ts-ignore
            uid?: string
            [key: string]: (Atomic | Composite)[] | { '@list': (Atomic | Composite)[] };
        };

    }

    /**
     * Union type representing any ODRL constraint (atomic or composite).
     */
    export type Constraint = Constraint.Atomic | Constraint.Composite;

    // --- Explicit Rule subtypes per ODRL spec ---

    /**
     * A Permission expresses the ability to exercise an Action over an Asset.
     * May include preconditions via `duty`.
     */
    export type Permission = {
        assignee?: string | string[];
        assigner?: string | string[];
        target?: string | string[];
        action: Action | Action[];
        constraint?: Constraint | Constraint[];
        uid?: string;
        duty?: Duty[]; // preconditions
        /**
         * Any custom properties
         */
        [key: string]: any
    };

    /**
     * A Prohibition expresses the inability to exercise an Action over an Asset.
     * May include remedies via `remedy` if infringed.
     */
    export type Prohibition = {
        assignee?: string | string[];
        assigner?: string | string[];
        target?: string | string[];
        action: Action | Action[];
        constraint?: Constraint | Constraint[];
        uid?: string;
        remedy?: Duty[]; // applied if infringed
        /**
         * Any custom properties
         */
        [key: string]: any
    };

    /**
     * A Duty is an obligation to exercise an Action.
     * May include fallbacks via `consequence` if not fulfilled.
     */
    export type Duty = {
        "@type"?: "Duty"
        assignee?: string | string[];
        assigner?: string | string[];
        target?: string | string[];
        action: Action | Action[];
        constraint?: Constraint | Constraint[];
        uid?: string;
        consequence?: Duty[]; // fallback obligations
        /**
         * Any custom properties
         */
        [key: string]: any
    };

    /**
     * An ODRL Policy expresses permissions, prohibitions, and/or obligations.
     * May be subclassed as Set, Offer, or Agreement.
     *
     * Supports compact notation: shared properties (e.g., `assigner`, `target`) may appear
     * at Policy level and are inherited by all Rules.
     *
     * @see https://www.w3.org/TR/odrl-model/#policy
     */
    export type Policy = {
        /**
         * JSON-LD context; typically "http://www.w3.org/ns/odrl.jsonld".
         */
        '@context'?: string | Record<string, string>;
        /**
         * Policy type: "Set" (default), "Offer", or "Agreement".
         */
        '@type'?: 'Set' | 'Offer' | 'Agreement' | string;
        /**
         * Globally unique IRI identifying this Policy.
         */
        uid?: string;
        /**
         * ODRL Profile(s) this Policy conforms to (required if using non-core terms).
         * @see https://www.w3.org/TR/odrl-model/#profile
         */
        profile?: string | string[];
        /**
         * Inheritance: IRIs of parent Policies whose Rules are inherited.
         */
        inheritFrom?: string | string[];
        /**
         * Conflict resolution strategy.
         * - "perm": permissions override prohibitions
         * - "prohibit": prohibitions override permissions
         * - "invalid": entire policy is invalid on conflict (default)
         */
        conflict?: 'perm' | 'prohibit' | 'invalid' | string;

        // --- Shared (Policy-level) properties (compact notation) ---
        assigner?: string | string[];
        assignee?: string | string[];
        target?: string | string[];
        action?: Action | Action[];

        // --- Rule groups ---
        permission?: Permission | Permission[];
        prohibition?: Prohibition | Prohibition[];
        obligation?: Duty[]; // always an array of Duties
        [key: string]: any;
    };
}
