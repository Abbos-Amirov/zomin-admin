import axios from "axios";
import { serverApi } from "../lib/config";
import { Member, MemberUpdateInput, UserInquiry } from "../lib/types/member";

class MemberService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getUsers(input: UserInquiry): Promise<Member[]> {
    try {
      let url = `${this.path}/admin/user/all?page=${input.page}&limit=${input.limit}`;
      if (input.search) url += `&search=${input.search}`;
      if (input.status) url += `&status=${input.status}`;
      const result = await axios.get(url, { withCredentials: true });
      console.log("getUsers: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, getUsers:", err);
      throw err;
    }
  }

  public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
    try {
      const url = `${this.path}/admin/user/edit`;
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("updateChosenUser: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, updateChosenUser:", err);
      throw err;
    }
  }
}

export default MemberService;
