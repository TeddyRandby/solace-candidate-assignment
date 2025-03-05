"use client";

import { ChangeEvent, ChangeEventHandler, FocusEvent, FocusEventHandler, useEffect, useState } from "react";
import { Advocate } from "./api/advocates/route";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);

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

    if (searchTerm) {
      const params = new URLSearchParams({
        term: searchTerm
      })

      url = `${url}?${params.toString()}`
    }

    console.log("fetching advocates...", { url });
    fetch(url).then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
      });
    });

  }, [searchTerm]);

  /*
   * The type of this handler is interesting - because it serves as the handler for change and focus events on our input element,
   * the type of the event is actually everything that *overlaps* on those two types (hence the &, as opposed to an |). Because
   * these types are so similar though, the distinction isn't really important in this case.
   */
  const assignSearchTermToCurrentValue = (e: ChangeEvent<HTMLInputElement> & FocusEvent<HTMLInputElement, Element>) => {
    setSearchTerm(e.target.value)
  }


  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: {searchTerm}
        </p>
        { /*
           * For event handlers that reuse behavior, I like to pull them out into specifically named variables.
           */ }
        <input style={{ border: "1px solid black" }} onFocus={assignSearchTermToCurrentValue} onChange={assignSearchTermToCurrentValue} />
        { /*
           * For event handlers as small as this, I prefer keeping the logic in-line in the markup. It reads nicely as someone is looking over the code:
           *
           * "Ah a button. What does it do? On click ... set search term to 'null'. It clears out the search term!"
           */ }
        <button onClick={() => setSearchTerm(null)}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {advocates.map((advocate) => {
            return (
              <tr key={advocate.id}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s) => (
                    <div key={s} >{s}</div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
