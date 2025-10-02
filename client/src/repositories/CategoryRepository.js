import HTTP from "@/common/http";

const resource = "categories";

export default {
  async findAll() {
    const response = await HTTP.get(resource);
    return response.data;
  },
  async findOne(id) {
    const response = await HTTP.get(`${resource}/${id}`);
    return response.data;
  }
};
