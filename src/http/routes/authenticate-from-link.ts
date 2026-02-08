import Elysia, { t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { authLinks } from "../../db/schema";
import dayjs from "dayjs";
import { auth } from "../auth";

export const authenticateFromLink = new Elysia().use(auth).get(
    "/auth-links/authenticate",
    async ({ query, jwt: { sign }, setCookie, set }) => {
        const { code, redirect } = query;

        const authLinkFromCode = await db.query.authLinks.findFirst({
            where(fields, { eq }) {
                return eq(fields.code, code);
            },
        });

        if (!authLinkFromCode) {
            throw new Error("Auth link not found.");
        }

        const daysSinceAuthLinkWasCreated = dayjs().diff(
            authLinkFromCode.createdAt,
            "days"
        );

        if (daysSinceAuthLinkWasCreated > 7) {
            throw new Error(
                "Auth link expired, please generate a new one."
            );
        }

        const managedRestaurant = await db.query.restaurants.findFirst({
            where(fields, { eq }) {
                return eq(fields.managerId, authLinkFromCode.userId);
            },
        });

        const token = await sign({
            sub: authLinkFromCode.userId,
            restaurantId: managedRestaurant?.id,
        });

        setCookie("auth", token, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        await db.delete(authLinks).where(eq(authLinks.code, code));

        if (redirect) {
            const redirectUrl = new URL(redirect);
            if (managedRestaurant) {
                redirectUrl.searchParams.set(
                    "restaurantId",
                    managedRestaurant.id
                );
            }
            set.redirect = redirectUrl.toString();
        }
    },
    {
        query: t.Object({
            code: t.String(),
            redirect: t.Optional(t.String()),
        }),
    }
);
