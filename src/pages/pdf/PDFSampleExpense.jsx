import React, { useContext } from "react";
import PDF from "../../components/pdf/SampleExpensePDF";
import { AuthContext } from "../../contexts/AuthContext";


export default function PDFSampleExpense() {
  const { userInfo } = useContext(AuthContext);

  console.log(userInfo);
  return <PDF title="Material Expense Report" userInfo={userInfo} />;
}
