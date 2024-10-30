import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";

export default function CreateUser() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
   
  }, []);

  return (
    <>
      <MainLayout loading={loading}>
        <div className="title-page">Manage Users</div>
        <FormUser/>
      </MainLayout>
    </>
  );
}
