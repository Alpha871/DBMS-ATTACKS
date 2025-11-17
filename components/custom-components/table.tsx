import React from "react";

interface TableProps {
  headers: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<Record<string, any>>;
}

const Table: React.FC<TableProps> = ({ headers, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-card border border-border rounded-lg">
        <thead>
          <tr className="bg-muted text-muted-foreground">
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 border-b border-border text-left text-sm font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-accent/40">
              {headers.map((header, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className="px-6 py-4 border-b border-border text-sm"
                >
                  {String(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
