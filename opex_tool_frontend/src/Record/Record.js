import React from "react";

const Record = ({ records, onBack, gvnumb}) =>{
    return( <div style={{ flex: 2 }}>
        <button onClick={onBack}>Atgriezties</button>
        <h2>Datne</h2>
        <div className="records-table-container">
            <p>{gvnumb}</p>
            <table className="table">
                <thead>
                    <tr>
                        <th>Datnes ID</th>
                        <th>Detaļas</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length > 0 ? (
                        records.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.detail}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2}>No records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>)
}

export default Record;