
import { apiSlice } from "./apiSlice";

export const trashApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTrashItems: builder.query({
            query: ({ workspaceId }) => ({
                url: `/trash`,
                method: "GET",
                params: { workspaceId },
            }),
            providesTags: ["Trash"],
        }),
    }),
});

export const { useGetTrashItemsQuery } = trashApiSlice;
