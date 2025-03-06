import { count as countRows, ilike, or, sql } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { NextRequest } from "next/server";

export type Advocate = typeof advocateData[0]

async function doquery(term: string | null, page = 0, pageSize = 100) {
  const select = {
    firstName: advocates.firstName,
    lastName: advocates.lastName,
    city: advocates.city,
    degree: advocates.degree,
    specialties: advocates.specialties,
    yearsOfExperience: advocates.yearsOfExperience,
    phoneNumber: advocates.phoneNumber,
  }

  /*
   * A potential optimization would be to perform the count and data queries in a single query instead of two.
   * This is possible with writing some custom sql, and maybe with drizzle, but I couldn't figure it out
   * quickly from reading the docs. This solution is simpler, and more than fast enough for now.
   */

  if (term) {
    // If we have a search term, perform a case-insenstive search across the text fields
    term = `%${term}%`
    const where = or(
      ilike(advocates.firstName, term),
      ilike(advocates.lastName, term),
      ilike(advocates.city, term),
      ilike(advocates.degree, term),
      sql`${advocates.specialties}::text ilike ${term}` // Cast the jsonb column 'specialties' to text, and search that.
    )

    // Since these queries are not reliant on each other, we can perform them in parallel with Promise.all
    const [[{ count }], data] = await Promise.all([
      db
        .select({ count: countRows() })
        .from(advocates)
        .where(where),
      db
        .select(select)
        .from(advocates)
        .where(where)
        .offset(page * pageSize)
        .limit(pageSize),
    ])

    return { count, data }
  }

  const [[{ count }], data] = await Promise.all([
    db
      .select({ count: countRows() })
      .from(advocates),
    db
      .select(select)
      .from(advocates)
      .offset(page * pageSize)
      .limit(pageSize)
  ])

  return { count, data }
}

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term")

  let page = parseInt(req.nextUrl.searchParams.get("page") ?? "")
  const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") ?? "")

  if (isNaN(page) || isNaN(pageSize)) {
    throw new Error("Invalid or missing pagination arguments")
  }

  // Clamp the page to a minimum of zero
  page = Math.max(page, 0)

  let { count, data } = await doquery(term, page, pageSize)

  const maxPage = Math.floor(count / pageSize)

  const hasMore = page < maxPage

  return Response.json({ data: { advocates: data, more: hasMore } });
}
