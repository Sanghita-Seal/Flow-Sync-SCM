import * as usersService from "./users.service.js";

export async function getUsers(req, res, next) {
  try {
    const users = await usersService.listUsers();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role || !["manager", "user"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'manager' or 'user'" });
    }
    const result = await usersService.updateUserRole(userId, role);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}
