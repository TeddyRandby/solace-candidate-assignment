"use client";

import { ChangeEvent, FocusEvent, MouseEvent, useEffect, useState } from "react";
import { Advocate } from "./api/advocates/route";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);

  const [page, setPage] = useState<number>(0);
  const PAGE_SIZE = 4

  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    /*
     * Whenever the search term changes, fetch new results
     * from the server.
     *
     * In a larger application (where cacheing and round-trips are a concern),
     * it would be better to use some sort of data-fetching library
     * for react here (something like React-Query).
     *
     * Since this use case is simple enough for now, just sticking
     * with builtins is fine.
     */

    let url = "/api/advocates"

    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: PAGE_SIZE.toString()
    })

    if (searchTerm) {
      params.append("term", searchTerm)
    }

    url = `${url}?${params.toString()}`

    console.log("fetching advocates...", { url });
    fetch(url).then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data.advocates);
        setHasMore(jsonResponse.data.more);
      });
    });

  }, [searchTerm, page]);

  /*
   * The type of this handler is interesting - because it serves as the handler for change and focus events on our input element,
   * the type of the event is actually everything that *overlaps* on those two types (hence the &, as opposed to an |). Because
   * these types are so similar though, the distinction isn't really important in this case.
   */
  const assignSearchTermToCurrentValue = (e: ChangeEvent<HTMLInputElement> & FocusEvent<HTMLInputElement, Element>) => {
    setSearchTerm(e.target.value)
    setPage(0)
  }

  const resetSearchTerm = (e: MouseEvent<HTMLButtonElement>) => {
    setSearchTerm(null)
    setPage(0)
  }


  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div className="flex">
        <button className="group bg-gray-100 px-4 border border-gray-300 rounded-l-lg" onClick={resetSearchTerm}>
          <svg className="w-6 h-6 text-gray-500 group-hover:font-bold  group-hover:text-gray-800 transition-all" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
          </svg>

        </button>
        <input className="bg-gray-100 border-l-0 border border-gray-300 rounded-r-lg text-gray-900 text-sm focus:ring-blue-200 focus:border-blue-200 block w-full p-2.5" onFocus={assignSearchTermToCurrentValue} onChange={assignSearchTermToCurrentValue} value={searchTerm ?? ""} />
      </div>
      <br />
      <br />
      <div className="flex items-center ">
        <div className="grow" />
        <button className="px-2 text-white bg-gray-400 enabled:hover:bg-gray-700 rounded-l-lg border-solid enabled:hover:shadow-lg" disabled={page == 0} onClick={() => setPage(page - 1)}>-</button>
        <p className="px-4 text-white bg-gray-400">{page + 1}</p>
        <button className="px-2 text-white bg-gray-400 enabled:hover:bg-gray-700 rounded-r-lg border-solid enabled:hover:shadow-lg" disabled={!hasMore} onClick={() => setPage(page + 1)}>+</button>
        <div className="grow" />
      </div>
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr>
            <th className="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 ">First Name</th>
            <th className="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 ">Last Name</th>
            <th className="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 ">City</th>
            <th className="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 ">Degree</th>
            <th className="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 ">Specialties</th>
            <th className="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 ">Years of Experience</th>
            <th className="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 ">Phone Number</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {advocates.map((advocate) => {
            return (
              <tr className="group" key={advocate.id}>
                <td className="border-b border-gray-100 p-4 pl-8 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">{advocate.firstName}</td>
                <td className="border-b border-gray-100 p-4 pl-8 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">{advocate.lastName}</td>
                <td className="border-b border-gray-100 p-4 pl-8 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">{advocate.city}</td>
                <td className="border-b border-gray-100 p-4 pl-8 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">{advocate.degree}</td>
                <td className="border-b border-gray-100 p-4 pl-8 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">
                  <button className="select-none text-gray-900 hover:bg-gray-900 hover:text-white  transition-all rounded-lg py-2 px-2 text-center align-middle font-sans text-xs font-bold uppercase text-white  hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" popoverTarget={`specialties-${advocate.id}`}>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                      <path d="M16 0H4a2 2 0 0 0-2 2v1H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.929 17H7.071a.5.5 0 0 1-.5-.5 3.935 3.935 0 1 1 7.858 0 .5.5 0 0 1-.5.5Z" />
                    </svg>
                  </button>
                  <div className="absolute p-4 font-sans text-sm font-normal break-words whitespace-normal bg-white border rounded-lg shadow-lg w-max border-blue-gray-50 text-blue-gray-500 shadow-blue-gray-500/10 focus:outline-none" popover="auto" id={`specialties-${advocate.id}`}>
                    <ul role="tooltip">
                      {advocate.specialties.map((s) => (
                        <li key={s} >{s}</li>
                      ))}
                    </ul>
                  </div>
                </td>
                <td className="border-b border-gray-100 p-4 pl-8 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">{advocate.yearsOfExperience}</td>
                <td className="border-b border-gray-100 p-4 pl-8 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
