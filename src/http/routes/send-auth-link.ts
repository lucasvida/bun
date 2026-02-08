import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import { authLinks } from "../../db/schema";
import { createId } from "@paralleldrive/cuid2";
import { env } from "../../../env";

export const sendAuthLink = new Elysia().post("/authenticate", async ({ body, set }) => {
    const { email } = body;

    const userFromEmail = await db.query.users.findFirst({
        where(fields, { eq }) {
            return eq(fields.email, email);
        },
    });
    if (!userFromEmail) {
        set.status = 404;
        return { error: "User not found" };
    }
    const authLinkCode = createId();

    await db.insert(authLinks).values({
        code: authLinkCode,
        userId: userFromEmail.id,
    });
    // TODO: Send email with auth link code
    const authLink = new URL("/auth-links/authenticate", env.API_BASE_URL);
    authLink.searchParams.set("code", authLinkCode);
    authLink.searchParams.set("redirect_url", env.AUTH_REDIRECT_URL);
    console.log(authLink.toString());

    return { authLinkCode };
}, {
    body: t.Object({
        email: t.String({ format: "email" }),
    }),
    response: t.Union([
        t.Object({ authLinkCode: t.String() }),
        t.Object({ error: t.String() }),
    ]),
});