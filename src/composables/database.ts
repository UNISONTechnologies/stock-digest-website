import type {
    DatabaseUser,
    HarperDatabaseUser,
    HarperRequest,
} from "../models";

export const useDatabase = () => {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${import.meta.env.VITE_HARPERDB_TOKEN}`,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const harperRequest = async (body: HarperRequest): Promise<any> => {
        const response = await fetch(
            import.meta.env.VITE_HARPERDB_HOST as string,
            {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                redirect: "follow",
            },
        );

        if (response.ok) {
            const json = response.json();
            return json;
        } else {
            return Promise.reject(response);
        }
    };

    const getUserDetails = async (
        userId: string,
    ): Promise<DatabaseUser | null> => {
        const request = await harperRequest({
            operation: "sql",
            sql: `SELECT * FROM ${import.meta.env.VITE_HARPERDB_SCHEMA}.${
                import.meta.env.VITE_HARPERDB_TABLE
            } where id = '${userId}'`,
        });

        const dbUsers: DatabaseUser[] = request.map(
            (dbUser: HarperDatabaseUser): DatabaseUser => {
                delete dbUser["__createdtime__"];
                delete dbUser["__updatedtime__"];

                return dbUser as DatabaseUser;
            },
        );

        if (dbUsers.length === 0) {
            await createUser(userId);
            return { id: userId, timeperiod: "today", symbols: [] };
        } else {
            return dbUsers[0];
        }
    };

    const createUser = async (userId: string): Promise<void> => {
        await harperRequest({
            operation: "insert",
            schema: import.meta.env.VITE_HARPERDB_SCHEMA as string,
            table: import.meta.env.VITE_HARPERDB_TABLE as string,
            records: [{ id: userId, timeperiod: "today", symbols: [] }],
        });
    };

    const updateUserDetails = async (dbUser: DatabaseUser): Promise<void> => {
        await harperRequest({
            operation: "update",
            schema: import.meta.env.VITE_HARPERDB_SCHEMA as string,
            table: import.meta.env.VITE_HARPERDB_TABLE as string,
            records: [dbUser],
        });
    };

    return { getUserDetails, updateUserDetails };
};
