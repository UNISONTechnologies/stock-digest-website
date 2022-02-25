export type User = {
    user: string;
    email: string | null;
    timePeriod: "today" | "the past week";
    symbols: string[];
};

export type DatabaseUser = {
    id: string;
    timeperiod: "today" | "the past week";
    symbols: string[];
};

export type HarperDatabaseUser = DatabaseUser & {
    __createdtime__?: string;
    __updatedtime__?: string;
};

export type HarperRequest = {
    operation: "insert" | "update" | "sql";
    sql?: string;
    schema?: string;
    table?: string;
    records?: DatabaseUser[];
};
