import HTTP from "@/common/http";

const resource = "users";

export default {
  async findAll() {
    const response = await HTTP.get(`${resource}`);
    return response.data;
  },
  
  async activate(id) {
    const response = await HTTP.put(`${resource}/${id}/active`);
    return response.data;
  },
  
  async deactivate(id) {
    const response = await HTTP.delete(`${resource}/${id}/active`);
    return response.data;
  },
  
  async delete(id) {
    const response = await HTTP.delete(`${resource}/${id}`);
    return response.data;
  }
};