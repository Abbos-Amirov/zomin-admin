import { Dispatch } from "@reduxjs/toolkit";
import EditUserDialog from "./EditUserDialog";
import UserFilter from "./UserFilter";
import UsersTable from "./UsersTable";
import { Member, MemberUpdateInput, UserInquiry } from "../../lib/types/member";
import { setUsers } from "./slice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import MemberService from "../../services/Member.service";
import { sweetErrorHandling } from "../../lib/sweetAlert";

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setUsers: (data: Member[]) => dispatch(setUsers(data)),
});

export default function UsersPage() {
  const { setUsers } = actionDispatch(useDispatch());

  const [open, setOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<MemberUpdateInput>({ _id: "" });
  const [userSearch, setUserSearch] = useState<UserInquiry>({
    page: 1,
    limit: 10,
    search: "",
  });

  useEffect(() => {
    const member = new MemberService();
    member
      .getUsers(userSearch)
      .then((data) => setUsers(data))
      .catch((err) => {
        console.log(err);
        sweetErrorHandling(err).then();
      });
  }, [userSearch]);

  return (
    <>
      <UserFilter userSearch={userSearch} setUserSearch={setUserSearch} />

      <UsersTable
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        setOpen={setOpen}
        edit={edit}
        setEdit={setEdit}
      />

      <EditUserDialog
        open={open}
        setOpen={setOpen}
        edit={edit}
        setEdit={setEdit}
        userSearch={userSearch}
        setUserSearch={setUserSearch}
      />
    </>
  );
}
