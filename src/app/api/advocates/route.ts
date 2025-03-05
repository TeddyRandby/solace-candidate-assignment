import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { NextRequest } from "next/server";

export type Advocate = typeof advocateData[0]

export function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term")
  // Uncomment this line to use a database
  // const data = await db.select().from(advocates);

  let data = advocateData;
  console.log(term)

  if (term) {
    /*
     * This seems like the cleanest way to perform case-insensitive
     * search in javascript (aside from converting everything to lower-case first).
     * A regex is compiled once, and matching is relatively fast. Converting
     * all strings and search terms to lowercase can be significant overhead.
     * 
     * If there was actually a database layer, the case-insensitive portion
     * could be handled at that level (and that would be way better)
     */
    const caseInsensitiveMatch = new RegExp(term, "i")

    data = data.filter((advocate) => {
      return (
        advocate.firstName.match(caseInsensitiveMatch) ||
        advocate.lastName.match(caseInsensitiveMatch) ||
        advocate.city.match(caseInsensitiveMatch) ||
        advocate.degree.match(caseInsensitiveMatch) ||
        advocate.specialties.some((specialty) => specialty.match(caseInsensitiveMatch))
      );
    })
  }

  let page = parseInt(req.nextUrl.searchParams.get("page") ?? "")
  const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") ?? "")

  if (isNaN(page) || isNaN(pageSize)) {
    throw new Error("Invalid or missing pagination arguments")
  }

  const maxPage = data.length % pageSize;

  // Clamp the page to a minimum of zero
  page = Math.max(page, 0)
  // Clamp the page to a maximum of max page
  page = Math.min(page, maxPage)

  const begin = page * pageSize
  const end = begin + pageSize


  data = data.slice(begin, end)

  const hasMore = page < maxPage

  return Response.json({ data: { advocates: data, more: hasMore } });
}
