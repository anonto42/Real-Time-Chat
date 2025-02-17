import { createApi , fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from './../../libs/config';

const api = createApi(
    {
        reducerPath:"api",
        baseQuery:fetchBaseQuery(
            {
                baseUrl:`${server}/api/chat/`
            }
        ),
        tagTypes:["Chat"],
        endpoints:(builder)=>(
            {
                myChats: builder.query({
                    query:()=>(
                        {
                            url:"my",
                            credentials:"include"
                        }
                    ),
                    providesTags:["Chat"]
                })
            }
        )
    }
)

export default api;
export const { useMyChatsQuery } = api;