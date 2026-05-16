// ─── Why types.ts exists separately from the JSON ────────────────────────────
// The JSON file holds DATA VALUES.
// This file holds the SHAPE of that data.
// They are separate concerns.
//
// Benefit 1: TypeScript enforces the shape at compile time.
//            If users.json has a typo in a field name, tsc catches it.
//
// Benefit 2: Any file importing the JSON can cast it to these types
//            and get full IntelliSense on every field.
//
// Benefit 3: If the data shape changes, you update types.ts in ONE place.
//            TypeScript then shows you every consumer that breaks.

export interface ValidUser {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface InvalidUser {
    username: string;
    password: string;
    expectedError: string;
}

export interface LockedUser {
    username: string;
    password: string;
    expectedError: string;
}

//we import this in tests, UserData, 
export interface UsersData {
    validUsers: ValidUser[];
    invalidUsers: InvalidUser[];
    lockedUser: LockedUser;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
}

export interface ProductsData {
    products: Product[];
    sortOptions: string[];
}