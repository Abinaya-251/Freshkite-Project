import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newStudent = new Student({
      name: req.body.name,
      course: req.body.course,
      year: req.body.year,
      email: req.body.email,
      phone: req.body.phone,
      password: hash,
    });

    await newStudent.save();
    res.status(200).send("Student has been created.");
  } catch (err) {
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const student = await Student.findOne({ name: req.body.name });
    if (!student) return next(createError(404, "Student not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      student.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { id: student._id, isAdmin: student.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, ...otherDetails } = student._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
  } catch (err) {
    next(err);
  }
};
