const express = require("express");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const { nanoid } = require("nanoid");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "marketiiitdm@gmail.com",
    pass: "dsxwyzansufwuxtu",
  },
});

const app = express();

// ===== CONFIG =====
const MONGO_URI = "mongodb://127.0.0.1:27017/canteen";
const INSTITUTE_TOTAL_BALANCE = 100000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { role } = req.body;
    console.log(req.body);

    if (!role) {
      return cb(new Error("Role missing"), null);
    }

    const uploadPath = `./uploads/${role}`;

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===== MONGOOSE =====
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ===== SCHEMAS =====
const transactionSchema = new mongoose.Schema(
  {
    txid: {
      type: String,

      unique: true, // important for QR / payments
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },

    amount: {
      type: Number,

      min: 1,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "BLOCKED", "EXPIRED", "REFUND"],
      default: "PENDING",
    },

    expiresAt: {
      type: Date, // QR expiry time
    },

    completedAt: {
      type: Date, // when SUCCESS / FAILED
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

const collegeTransactionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: String,
    amount: Number,
    category: String,
    txid: String,
    vendorid: String,
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "BLOCKED" , "REFUND"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const CollegeSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
  transactions: [collegeTransactionSchema],
});

// POST /vendor/expire-qr

const AdminSchema = new mongoose.Schema(
  {
    email : String,
    password : String,
    complaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],
  }
)


const VendorTransactionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    amount: Number,
    category: String,
    txid: String,
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "BLOCKED" , "REFUND"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);
const redeemSchema = new mongoose.Schema({
  amount: Number,
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED" , "REFUND"],
    default: "PENDING",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  Ifsc:String,
  Acc : String,
  closingBalance: Number,
});
const Vendorschema = new mongoose.Schema({
  vendorName: String,
  vendorid: String,
  category: String,
  Email: String,
  password: String,
  ImageUrl: String,
  Mpin: String,
  isSuspended: { type: Boolean, default: false },
  kyc: {
    imageUrl: String,
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "success"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  Wallet: {
    type: Number,
    default: 0,
  },
  Acc:String , 
  Ifsc : String,
  redeem: [redeemSchema],
  notifications: [{
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "error", "success"], default: "info" },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  }],
  adminActions: [{
    action: { type: String, required: true }, // "freeze" or "unfreeze"
    reason: { type: String, required: true },
    performedBy: { type: String, default: "admin" },
    performedAt: { type: Date, default: Date.now },
    description: { type: String, required: true }
  }],
});

const notificationSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["ALL", "STUDENT", "VENDOR", "SUBADMIN"],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  createdAt: { type: Date, default: Date.now },
});


const Notification = mongoose.model("Notification", notificationSchema);

const ComplaintSchema = new mongoose.Schema(
  {
    // 🔗 Who raised the complaint
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Dynamic ref will be handled in population
    },

    // 🆔 Human-readable complaint ID
    complaintId: {
      type: String,
      required: true,
    },

    // 📝 Complaint description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // 🖼 Optional screenshot (URL / path)
    screenshot: {
      type: String, // Cloudinary URL / local path
      default: null,
    },
    role: {
      type: String,
      default: "student",
    },

    // 👥 Multiple admins assigned to this complaint
    assignedAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],

    isForwarded :{ type : Boolean , default : false },

    // 📝 Track which SubAdmin forwarded the complaint
    forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubAdmin",
      default: null,
    },

    // 📅 When the complaint was forwarded
    forwardedAt: {
      type: Date,
      default: null,
    },

    // 💬 Admin response to the complaint
    response: {
      type: String,
      default: null,
    },

    // 📌 Complaint lifecycle status
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const SubAdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String },
  password: String,
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  imageUrl : String,
  notifications: [{
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "error", "success"], default: "info" },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  }],
});
const SubAdmin = mongoose.model("SubAdmin", SubAdminSchema);

const StudentSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    isFrozen: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    collegeEmail: { type: String, required: true, unique: true },
    parentEmail: String,
    password: String,
    ImageUrl: String,
    Mpin: String,
    walletBalance: { type: Number, default: 0 },
    transactions: [transactionSchema],
    kyc: {
      imageUrl: String,
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
   notifications: [{
     message: { type: String, required: true },
     type: { type: String, enum: ["info", "warning", "error", "success"], default: "info" },
     createdAt: { type: Date, default: Date.now },
     read: { type: Boolean, default: false },
   }],
   adminActions: [{
     action: { type: String, required: true }, // "freeze", "unfreeze", "suspend", "unsuspend"
     reason: { type: String, required: true },
     performedBy: { type: String, default: "admin" },
     performedAt: { type: Date, default: Date.now },
     description: { type: String, required: true }
   }],
  },
  {
    timestamps: true, // ⭐ THIS CREATES createdAt & updatedAt
  }
);

const User = mongoose.model("User", StudentSchema, "users");
const College = mongoose.model("College", CollegeSchema);
const Vendor = mongoose.model("Vendor", Vendorschema);

const Complaint = mongoose.model("Complaint", ComplaintSchema);
const Redeem = mongoose.model("Redeem", redeemSchema);
const vendorTransaction = mongoose.model(
  "vendorTransaction",
  VendorTransactionSchema
);
const Admin = mongoose.model("Admin" , AdminSchema);
// ===== ASSIGN EXISTING COMPLAINTS TO SUBADMINS (ONE-TIME FIX) =====
app.post("/fix-complaint-assignments", async (req, res) => {
  try {
    // Get all existing complaints
    const complaints = await Complaint.find({});
    const subAdmins = await SubAdmin.find({});
    
    if (subAdmins.length === 0) {
      return res.json({ message: "No SubAdmins found" });
    }
    
    let updatedCount = 0;
    
    // Assign each complaint to all SubAdmins
    for (const complaint of complaints) {
      await SubAdmin.updateMany(
        {},
        { $addToSet: { complaints: complaint._id } }
      );
      updatedCount++;
    }
    
    res.json({ 
      success: true, 
      message: `Assigned ${updatedCount} existing complaints to ${subAdmins.length} SubAdmins` 
    });
  } catch (err) {
    console.error("Error fixing complaint assignments:", err);
    res.status(500).json({ message: "Failed to fix assignments" });
  }
});

// ===== ROUTES =====

app.post("/usere/profile", async (req, res) => {
  try {
    const { vendorId } = req.body; // this is actually student/user _id

    const user = await User.findById(vendorId).select(
      "firstName lastName collegeEmail parentEmail ImageUrl walletBalance"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("User profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Register
app.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    parentEmail,
    password,
    profileImage,
    mpin,
    kyc,
    role,
    Acc ,
    Ifsc
  } = req.body;
  console.log("Role at backend:", role);
  console.log(kyc);
  if (role == "student") {
    const newStudent = new User({
      firstName,
      lastName,
      collegeEmail: email,
      parentEmail,
      password,
      ImageUrl: profileImage,
      Mpin: mpin,
      kyc,
    });

    await newStudent.save();
    res.status(201).json({
      message: "Student created successfully",
      userId: newStudent._id,
      username: newStudent.firstName,
      userEmail: newStudent.collegeEmail,
      ImageUrl: newStudent.ImageUrl,
      walletBalance: 0,
      isFrozen: true,
    });
  } else if (role == "vendor") {
    async function generateUniqueVendorId() {
      let vendorId;
      let exists = true;

      while (exists) {
        vendorId = `vdr${nanoid(4)}`; // e.g., vdrA9f2
        exists = await Vendor.exists({ vendorid: vendorId });
      }

      return vendorId;
    }
    const newVendor = new Vendor({
      vendorName: firstName + " " + lastName,
      vendorid: await generateUniqueVendorId(),
      Email: email,
      password,
      kyc,
      ImageUrl: profileImage,
      Mpin: mpin,
      Acc , Ifsc
    });
    console.log(newVendor);
    await newVendor.save();
    res.status(201).json({
      message: "Vendor created successfully",
      vendorId: newVendor.vendorid,
      vendorName: newVendor.vendorName,
      ImageUrl: newVendor.ImageUrl,
    });
  }
});
// Upload image
app.post("/upload", upload.single("profileImage"), (req, res) => {
  const { role } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "File not uploaded" });
  }

  const fileUrl = `http://localhost:5000/uploads/${role}/${req.file.filename}`;

  console.log("Role in profile upload:", role);
  console.log(fileUrl);

  res.json({ url: fileUrl });
});

// Upload subadmin profile picture
const subAdminStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `./uploads/subAdminPics`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const subAdminUpload = multer({ storage: subAdminStorage });

app.post("/upload/subadmin", subAdminUpload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File not uploaded" });
  }

  const fileUrl = `http://localhost:5000/uploads/subAdminPics/${req.file.filename}`;
  console.log("SubAdmin profile upload:", fileUrl);

  res.json({ url: fileUrl });
});

app.post("/login", async (req, res) => {
  console.log("U are in inside")
  const { email, password } = req.body;

  console.log(req.body)

  // 🎓 STUDENT LOGIN
  const user = await User.findOne({ collegeEmail: email });
  if (user) {
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Check if student is suspended
    if (user.isSuspended) {
      return res.status(403).json({ 
        error: "Your account has been suspended by the admins/subadmins for fraud actions. You cannot login to your account. Contact admins.",
        isSuspended: true 
      });
    }

    return res.json({
      role: "student",
      username: user.firstName,
      userId: user._id,
      isFrozen: user.isFrozen,
      isSuspended: user.isSuspended,
      imageUrl: user.ImageUrl,
      walletBalance: user.walletBalance,
      userCreatedAt: user.createdAt,
    });
  }

  // 🏪 VENDOR LOGIN
  const vendor = await Vendor.findOne({ Email: email });
  if (vendor) {
    if (vendor.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Check if vendor is suspended
    if (vendor.isSuspended) {
      return res.status(403).json({ 
        error: "Your account has been suspended by the admins/subadmins for fraud actions. You cannot login to your account. Contact admins.",
        isSuspended: true 
      });
    }

    if (vendor.kyc.status !== "success") {
      return res.status(403).json({ error: "KYC not verified" });
    }

    return res.json({
      role: "vendor",
      vendorName: vendor.vendorName,
      balance: vendor.Wallet,
      imageUrl: vendor.ImageUrl,
      vendorId: vendor._id,
      isSuspended: vendor.isSuspended,
    });
  }

  // 👔 SUBADMIN LOGIN
  const subAdmin = await SubAdmin.findOne({ email: email });
  if (subAdmin) {
    if (subAdmin.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.json({
      role: "SubAdmin",
      SubAdminName: subAdmin.name,
      imageUrl: subAdmin.imageUrl,
      subAdminId: subAdmin._id,
    });
  }

  // 🛡️ ADMIN LOGIN
  const admin = await Admin.findOne({ email: email });
  if (admin) {
    if (admin.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.json({
      role: "admin",
      adminId: admin._id,
      imageUrl: admin.imageUrl,
    });
  }

  // ❌ NO USER FOUND
  return res.status(404).json({ error: "Email not registered" });
});

// GET /redeem/history/:userId
app.get("/redeem/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Fetch all redeem requests for this user, sorted newest first
    const history = await Redeem.find({ userId }).sort({ date: -1 });

    res.json(history);
  } catch (err) {
    console.error("Error fetching redeem history:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/vendor/create-qr", async (req, res) => {
  try {
    const { vendorId, amount } = req.body;
    console.log(req.body);
    if (!vendorId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid vendorId or amount" });
    }

    const vendor = await Vendor.findById(vendorId);
    console.log(vendor);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const tid = generateTxnId(9);

    // ⏱ QR expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ CREATE PENDING TRANSACTION
    const transaction = await Transaction.create({
      txid: tid,
      vendorId: vendor._id,
      amount,
      status: "PENDING",
      expiresAt,
    });

    const qrText = `Campuspay::"${vendor._id},amount:${amount
      .toString()
      .padStart(4, "0")},tid:${tid}"`;

    res.json({
      qrText,
      vendorId: vendor._id,
      amount,
      txid: tid,
      expiresAt,
      qrId: transaction._id, // <-- add thiss
    });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ error: "QR generation failed" });
  }
});

app.post("/vendor/:vendorId", async (req, res) => {
  const { vendorId } = req.params;
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    console.log(vendor);
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vendor details" });
  }
});

// Get transactions (secure: use userId from params)
app.get("/transactions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const transactions = (user.transactions || []).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Extract user's name
    const { firstName, lastName } = user;
    const txid = transactions.txid;
    const vendorId = await Transaction.find({txid : txid})
    // If you want vendor names for each transaction
    const transactionsWithNames = await Promise.all(
      transactions.map(async (tx) => {
        let vendorName = "";
        if (tx.vendorId) {
          const vendor = await Vendor.findById(vendorId);
          vendorName = vendor ? vendor.vendorName : "";
        }
        return {
          ...tx.toObject(), // convert Mongoose doc to plain object
          firstName,
          lastName,
          vendorName,
        };
      })
    );

    res.json(transactionsWithNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit
}

const otpStore = {};

app.post("/send-otp", async (req, res) => {
  try {
    const { Email, PEmail, role } = req.body;
    if (!Email || (role == "student" && !PEmail)) {
      return res.status(400).json({ message: "Both emails are required" });
    }
    console.log(Email);
    // Check if student email already exists
    const existingUser = await User.findOne({ collegeEmail: Email });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "Student email already exists" });
    }
    console.log(existingUser);

    // Optional: check if student and parent emails are equal
    if (Email === PEmail) {
      return res
        .status(400)
        .json({ message: "Student email and Parent email cannot be the same" });
    }

    // Generate separate OTPs
    const studentOtp = Math.floor(100000 + Math.random() * 900000);
    const parentOtp = Math.floor(100000 + Math.random() * 900000);
    console.log("OTPs:", studentOtp, parentOtp);

    // Store separately in memory (or DB if you prefer)
    otpStore[Email] = {
      otp: studentOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    otpStore[PEmail] = {
      otp: parentOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    // Send OTP to student
    await transporter.sendMail({
      to: Email,
      subject: "Campus Pay OTP Verification - Student",
      html: `<h2>Your OTP is ${studentOtp}</h2><p>Valid for 5 minutes</p>`,
    });

    // Send OTP to parent
    if (role == "student") {
      await transporter.sendMail({
        to: PEmail,
        subject: "OTP Verification - Parent",
        html: `<h2>Your OTP is ${parentOtp}</h2><p>Valid for 5 minutes</p>`,
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to both emails separately",
      studentEmail: Email,
      parentEmail: PEmail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/verify-both-otp", (req, res) => {
  const { studentEmail, parentEmail, studentOtp, parentOtp, role } = req.body;

  // ---------------- BASIC VALIDATION ----------------
  if (!studentEmail || !studentOtp) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  if (role === "student" && (!parentEmail || !parentOtp)) {
    return res.status(400).json({ message: "Parent OTP required" });
  }

  // ---------------- FETCH OTP RECORDS ----------------
  const studentRecord = otpStore[studentEmail];
  const parentRecord = role === "student" ? otpStore[parentEmail] : null;

  if (!studentRecord) {
    return res
      .status(400)
      .json({ message: "OTP not found. Request a new one." });
  }

  if (role === "student" && !parentRecord) {
    return res
      .status(400)
      .json({ message: "Parent OTP not found. Request a new one." });
  }

  const now = Date.now();

  // ---------------- EXPIRY CHECK ----------------
  if (now > studentRecord.expiresAt) {
    delete otpStore[studentEmail];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (role === "student" && now > parentRecord.expiresAt) {
    delete otpStore[parentEmail];
    return res.status(400).json({ message: "Parent OTP expired" });
  }

  // ---------------- OTP MATCH CHECK ----------------
  if (parseInt(studentOtp) !== studentRecord.otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (role === "student" && parseInt(parentOtp) !== parentRecord.otp) {
    return res.status(400).json({ message: "Invalid Parent OTP" });
  }

  // ---------------- CLEANUP ----------------
  delete otpStore[studentEmail];
  if (role === "student") delete otpStore[parentEmail];

  // ---------------- SUCCESS ----------------
  return res.status(200).json({
    message:
      role === "vendor"
        ? "OTP verified successfully"
        : "Both OTPs verified successfully",
  });
});

app.post("/resend-otp", async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const existingUser = await User.findOne({ collegeEmail: email });
    if (existingUser && !(type === "f-pass")) {
      return res.status(400).json({ message: "Student email already exists" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    const subject = email.includes("@")
      ? "OTP Verification"
      : "OTP Verification";

    await transporter.sendMail({
      to: email,
      subject: "Campus Pay - Otp",
      html: `<h2>Your new OTP is ${otp}</h2><p>Valid for 5 minutes</p>`,
    });

    res.status(200).json({ message: `OTP sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});


app.post("/admin/notification/add", async (req, res) => {
  const { role, title, message } = req.body;

  if (!role || !title || !message) {
    return res.status(400).json({ msg: "All fields required" });
  }

  try {
    // If ALL → single notification
    const notification = new Notification({
      role,
      title,
      message,
    });

    await notification.save();

    res.json({ msg: "Notification added successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add notification" });
  }
});

app.get("/admin/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch notifications" });
  }
});


// POST /add-institute-funds
app.post("/add-institute-funds", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, msg: "Invalid amount" });
    }

    const college = await College.findOne();
    if (!college) {
      return res.status(404).json({ success: false, msg: "College not found" });
    }

    college.amount += amount;
    await college.save();

    res.json({ success: true, newBalance: college.amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});


app.post("/forgot-otp", async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log(email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedRole = role ? role.toLowerCase() : null;

    // ================= STUDENT FLOW =================
    if (!normalizedRole || normalizedRole === "student") {
      const user = await User.findOne({ collegeEmail: email });

      if (user) {
        // Check if student is suspended
        if (user.isSuspended) {
          return res.status(403).json({ 
            message: "Your account has been suspended. You cannot reset your password while suspended. Contact admins for assistance." 
          });
        }

      const studentEmail = user.collegeEmail;
      const parentEmail = user.parentEmail;

      const studentOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const parentOtp = Math.floor(100000 + Math.random() * 900000).toString();

      otpStore[studentEmail] = {
        otp: studentOtp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };

      otpStore[parentEmail] = {
        otp: parentOtp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };

      await transporter.sendMail({
        to: studentEmail,
        subject: "Student OTP - Password Reset",
        html: `<h2>Your OTP is ${studentOtp}</h2><p>Valid for 5 minutes</p>`,
      });

      await transporter.sendMail({
        to: parentEmail,
        subject: "Parent OTP - Password Reset",
        html: `<h2>Your OTP is ${parentOtp}</h2><p>Valid for 5 minutes</p>`,
      });

      return res.status(200).json({
        message: "OTPs sent to student and parent emails",
        studentEmail,
        parentEmail,
        role: "student",
      });
    }
      if (normalizedRole === "student") {
        return res.status(404).json({ message: "User does not exist" });
      }
    }

    // ================= VENDOR FLOW =================
    if (!normalizedRole || normalizedRole === "vendor") {
      const v = await Vendor.findOne({ Email: email });

      if (v) {
        // Check if vendor is suspended
        if (v.isSuspended) {
          return res.status(403).json({ 
            message: "Your account has been suspended. You cannot reset your password while suspended. Contact admins for assistance." 
          });
        }

        if (v.kyc?.status !== "success") {
          return res.status(403).json({ message: "KYC not verified" });
        }

        const vendorOtp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore[email] = {
          otp: vendorOtp,
          expiresAt: Date.now() + 5 * 60 * 1000,
        };

        await transporter.sendMail({
          to: email,
          subject: "Vendor OTP - Password Reset",
          html: `<h2>Your OTP is ${vendorOtp}</h2><p>Valid for 5 minutes</p>`,
        });

        return res.status(200).json({
          message: "OTP sent to vendor email",
          email,
          role: "vendor",
        });
      }

      if (normalizedRole === "vendor") {
        return res.status(404).json({ message: "User does not exist" });
      }
    }

    // ================= SUBADMIN FLOW =================
    if (!normalizedRole || normalizedRole === "subadmin") {
      const subAdmin = await SubAdmin.findOne({ email: email });

      if (subAdmin) {
        const subAdminOtp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore[email] = {
          otp: subAdminOtp,
          expiresAt: Date.now() + 5 * 60 * 1000,
        };

        await transporter.sendMail({
          to: email,
          subject: "SubAdmin OTP - Password Reset",
          html: `<h2>Your OTP is ${subAdminOtp}</h2><p>Valid for 5 minutes</p>`,
        });

        return res.status(200).json({
          message: "OTP sent to subadmin email",
          email,
          role: "SubAdmin",
        });
      }

      if (normalizedRole === "subadmin") {
        return res.status(404).json({ message: "User does not exist" });
      }
    }

    // ================= ADMIN FLOW =================
    if (!normalizedRole || normalizedRole === "admin") {
      const admin = await Admin.findOne({ email: email });

      if (admin) {
        const adminOtp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore[email] = {
          otp: adminOtp,
          expiresAt: Date.now() + 5 * 60 * 1000,
        };

        await transporter.sendMail({
          to: email,
          subject: "Admin OTP - Password Reset",
          html: `<h2>Your OTP is ${adminOtp}</h2><p>Valid for 5 minutes</p>`,
        });

        return res.status(200).json({
          message: "OTP sent to admin email",
          email,
          role: "admin",
        });
      }

      if (normalizedRole === "admin") {
        return res.status(404).json({ message: "User does not exist" });
      }
    }

    return res.status(404).json({ message: "User does not exist" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/institute-balance", async (req, res) => {
  try {
    const college = await College.findOne();
    if (!college) return res.status(404).json({ error: "College not found" });
    let balance = college.amount;
    console.log(balance);
    // now prints 1000000
    res.json({ balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/users-number", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const SubAdmins = await SubAdmin.countDocuments();
    res.json({
      totalUsers,
      totalVendors,
      SubAdmins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
  }
});


app.post("/payment-mid", async (req, res) => {
  try {
    let {
      userId,
      vendorId,
      amount,
      transactionId,
      Status = "SUCCESS",
    } = req.body;

    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    console.log("Payment request:", {
      userId,
      vendorId,
      amount,
      transactionId,
      Status,
    });

    // 1️⃣ Student lookup
    const student = await User.findById(userId);
    if (!student) {
      console.error("Student not found for userId:", userId);
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Vendor lookup: try ObjectId first, fallback to vendorid field
    let vendor = null;
    if (/^[0-9a-fA-F]{24}$/.test(vendorId)) {
      vendor = await Vendor.findById(vendorId);
    }
    if (!vendor) {
      vendor = await Vendor.findOne({ vendorid: vendorId });
    }
    if (!vendor) {
      console.error("Vendor not found for vendorId:", vendorId);
      return res.status(404).json({ message: "Vendor not found" });
    }

    // 3️⃣ College lookup
    const college = await College.findOne();
    if (!college) {
      console.error("No college document found");
      return res.status(404).json({ message: "College document missing" });
    }

    // 4️⃣ Block if college has insufficient balance
    if (Status === "SUCCESS" && college.amount < amount) {
      Status = "BLOCKED";
    }

    // 5️⃣ Deduct from college balance if SUCCESS
    if (Status === "SUCCESS") {
      await College.findOneAndUpdate({}, { $inc: { amount: -amount } });
    }

    // 6️⃣ Update student transactions & wallet
    await User.findByIdAndUpdate(student._id, {
      $push: {
        transactions: {
          txid: transactionId,
          userId,
          amount,
          vendorid: vendorId,
          category: vendor.category,
          status: Status,
        },
      },
      ...(Status === "SUCCESS" && { $inc: { walletBalance: amount } }),
    });

    // 7️⃣ Update Transaction collection
    await Transaction.findOneAndUpdate(
      { txid: transactionId },
      { status: Status, userId },
      { new: true }
    );

    // 8️⃣ Update vendor transactions & wallet
    await Vendor.findByIdAndUpdate(vendor._id, {
      $push: {
        transactions: {
          studentId: userId,
          amount,
          category: vendor.category,
          txid: transactionId,
          status: Status,
        },
      },
      ...(Status === "SUCCESS" && { $inc: { Wallet: amount } }),
    });

    // 9️⃣ Update college transaction log
    await College.findOneAndUpdate(
      {},
      {
        $push: {
          transactions: {
            txid: transactionId,
            studentId: userId,
            studentName: student.firstName + " " + student.lastName,
            amount,
            vendorid: vendorId,
            category: vendor.category,
            status: Status,
          },
        },
      }
    );

    res.json({
      success: true,
      status: Status,
      message: "Payment processed successfully",
    });
  } catch (err) {
    console.error("Payment processing failed:", err);
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
});

app.post("/vendor-name", async (req, res) => {
  const { vendorId } = req.body;
  console.log("Received vendorId:", vendorId);

  try {
    const vendor = await Vendor.findById(vendorId); // ✅ Correct usage
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({ vName: vendor.vendorName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/c-screenshot", upload.single("screenshot"), async (req, res) => {
  const { role } = req.body;
  const imageUrl = `http://localhost:5000/uploads/${role}/${req.file.filename}`;

  res.json({
    success: true,
    imageUrl,
  });
});

app.get("/admins", async (req, res) => {
  try {
    const admins = await SubAdmin.find({}, "name"); // fetch only the 'name' field
    // If you also want the ID to identify them on frontend:
    const adminList = admins.map((admin) => ({
      _id: admin._id,
      name: admin.name,
    }));
    res.json(adminList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

app.get("/subadmins", async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find({})
      .select("name email imageUrl complaints createdAt")
      .populate("complaints", "complaintId status createdAt");
    
    const subAdminList = subAdmins.map((subAdmin) => {
      const resolvedCount = subAdmin.complaints.filter(
        (complaint) => complaint.status === "resolved"
      ).length;
      
      return {
        _id: subAdmin._id,
        name: subAdmin.name,
        email: subAdmin.email,
        imageUrl: subAdmin.imageUrl,
        complaintsCount: subAdmin.complaints.length,
        resolvedComplaintsCount: resolvedCount,
        createdAt: subAdmin.createdAt,
        complaints: subAdmin.complaints,
      };
    });
    
    res.json(subAdminList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subadmins" });
  }
});

app.post("/subadmin/add", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingSubAdmin = await SubAdmin.findOne({ email });
    if (existingSubAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newSubAdmin = await SubAdmin.create({
      name,
      email,
      password,
      complaints: [],
    });

    res.status(201).json({
      success: true,
      subAdmin: {
        _id: newSubAdmin._id,
        name: newSubAdmin.name,
        email: newSubAdmin.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add subadmin" });
  }
});

app.delete("/subadmin/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const subAdmin = await SubAdmin.findByIdAndDelete(id);

    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    res.json({
      success: true,
      message: "SubAdmin removed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete subadmin" });
  }
});

// Get complaints assigned to a subadmin
app.get("/subadmin/:id/complaints", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching complaints for subAdmin ID:", id);
    
    // Get complaints where this subadmin's ID is in the assignedAdmins array AND not forwarded
    const complaints = await Complaint.find({ 
      assignedAdmins: id,
      isForwarded: false
    }).lean().sort({ createdAt: -1 });

    // Manually populate user data like admin endpoint
    const populatedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        let user = null;
        
        console.log(`Processing subadmin complaint ${complaint.complaintId}, role: ${complaint.role}, userId: ${complaint.userId}`);
        
        // Populate user based on role
        if (complaint.role === "vendor") {
          user = await Vendor.findById(complaint.userId)
            .select("vendorName Email vendorId");
        } else {
          user = await User.findById(complaint.userId)
            .select("firstName lastName collegeEmail");
        }
        
        console.log(`Found user for subadmin:`, user);

        return {
          ...complaint,
          userId: user
        };
      })
    );

    console.log(`Found ${populatedComplaints.length} complaints for subAdmin ${id}`);
    populatedComplaints.forEach(complaint => {
      console.log(`Complaint: ${complaint.complaintId}, User: ${complaint.userId?.firstName || complaint.userId?.vendorName}, Status: ${complaint.status}`);
    });

    res.json(populatedComplaints || []);
  } catch (err) {
    console.error("Error fetching subadmin complaints:", err);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// Resolve a complaint
app.post("/subadmin/complaint/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status: "resolved" },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Add notification to the user who raised the complaint
    await User.findByIdAndUpdate(
      complaint.userId,
      {
        $push: {
          notifications: {
            message: `Your complaint #${complaint.complaintId} has been resolved by SubAdmin.`,
            type: "success",
            createdAt: new Date(),
            read: false
          }
        }
      }
    );

    console.log(`Complaint ${complaint.complaintId} resolved by SubAdmin. Notification sent to user ${complaint.userId}.`);

    res.json({ success: true, complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resolve complaint" });
  }
});

// Respond to complaint (SubAdmin version)
app.post("/subadmin/complaint/:id/respond", async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({ message: "Response is required" });
    }

    // Update complaint with response and mark as resolved
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        response: response.trim(),
        status: "resolved"
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Add notification to the user who raised the complaint
    await Vendor.findByIdAndUpdate(
      complaint.userId,
      {
        $push: {
          notifications: {
            message: `Your complaint #${complaint.complaintId} has been resolved by SubAdmin. Response: ${response.trim()}`,
            type: "success",
            createdAt: new Date(),
            read: false
          }
        }
      }
    );

    console.log(`Complaint ${complaint.complaintId} resolved by SubAdmin. Notification sent to user ${complaint.userId}.`);

    res.json({ success: true, complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send response" });
  }
});

// Forward complaint to admin
app.post("/subadmin/complaint/:id/forward", async (req, res) => {
  try {
    const { id } = req.params;
    const { subAdminId } = req.body; // Get the SubAdmin ID from request body
    
    // Get all admins
    const admins = await Admin.find({});
    if (admins.length === 0) {
      return res.status(404).json({ message: "No admins found" });
    }

    // Get SubAdmin info for tracking
    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    // Add complaint to first admin (or you can choose which admin)
    const adminId = admins[0]._id;
    await Admin.findByIdAndUpdate(adminId, {
      $addToSet: { complaints: id },
    });

    // Mark complaint as forwarded with tracking info
    await Complaint.findByIdAndUpdate(id, {
      isForwarded: true,
      $push: { assignedAdmins: adminId },
      forwardedBy: subAdminId,
      forwardedAt: new Date(),
    });

    // Remove complaint from ALL subadmins' complaints array
    await SubAdmin.updateMany(
      {},
      { $pull: { complaints: id } }
    );

    res.json({ success: true, message: "Complaint forwarded to admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to forward complaint" });
  }
});

// Get complaints for admin
app.get("/admin/complaints", async (req, res) => {
  try {
    // Get all complaints from database
    const complaints = await Complaint.find({}).lean();

    // Manually populate all related data
    const populatedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        let user = null;
        
        console.log(`Processing complaint ${complaint.complaintId}, role: ${complaint.role}, userId: ${complaint.userId}`);
        
        // Populate user based on role
        if (complaint.role === "vendor") {
          user = await Vendor.findById(complaint.userId)
            .select("vendorName Email vendorId");
        } else {
          user = await User.findById(complaint.userId)
            .select("firstName lastName collegeEmail");
        }
        
        console.log(`Found user:`, user);
        
        const admins = await Admin.find({ 
          _id: { $in: complaint.assignedAdmins } 
        }).select("name email");

        let forwardedBy = null;
        if (complaint.forwardedBy) {
          forwardedBy = await SubAdmin.findById(complaint.forwardedBy)
            .select("name email");
        }

        return {
          ...complaint,
          userId: user,
          assignedAdmins: admins,
          forwardedBy: forwardedBy
        };
      })
    );

    res.json(populatedComplaints || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// Get vendor complaints for admin
app.get("/admin/vendor-complaints", async (req, res) => {
  try {
    // Get only vendor complaints that are forwarded
    const complaints = await Complaint.find({ 
      role: "vendor",
      isForwarded: true
    }).lean(); // Use lean for better performance

    // Manually populate vendor information
    const populatedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        const vendor = await Vendor.findById(complaint.userId)
          .select("vendorName Email vendorId");
        
        const admins = await Admin.find({ 
          _id: { $in: complaint.assignedAdmins } 
        }).select("name email");

        return {
          ...complaint,
          userId: vendor,
          assignedAdmins: admins
        };
      })
    );

    res.json(populatedComplaints || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vendor complaints" });
  }
});

// Respond to complaint
app.post("/admin/complaint/:id/respond", async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({ message: "Response is required" });
    }

    // Update complaint with response and mark as resolved
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        response: response.trim(),
        status: "resolved"
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Add notification to the user who raised the complaint
    if (complaint.role === "vendor") {
      // Send notification to vendor
      await Vendor.findByIdAndUpdate(
        complaint.userId,
        {
          $push: {
            notifications: {
              message: `Your complaint #${complaint.complaintId} has been resolved by Admin. Response: ${response.trim()}`,
              type: "success",
              createdAt: new Date(),
              read: false
            }
          }
        }
      );
      console.log(`Complaint ${complaint.complaintId} resolved by Admin. Notification sent to vendor ${complaint.userId}.`);
    } else {
      // Send notification to student
      await User.findByIdAndUpdate(
        complaint.userId,
        {
          $push: {
            notifications: {
              message: `Your complaint #${complaint.complaintId} has been resolved by Admin. Response: ${response.trim()}`,
              type: "success",
              createdAt: new Date(),
              read: false
            }
          }
        }
      );
      console.log(`Complaint ${complaint.complaintId} resolved by Admin. Notification sent to user ${complaint.userId}.`);
    }

    res.json({ success: true, complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send response" });
  }
});

// Get all vendors for admin KYC management
app.get("/admin/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({})
      .select("vendorName Email vendorId kyc ImageUrl createdAt")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

// Update vendor KYC status
app.post("/admin/vendor/:id/kyc", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "verified", "rejected", or "success"

    if (!["verified", "rejected", "success"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { "kyc.status": status },
      { new: true }
    ).select("vendorName Email kyc");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ success: true, vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update KYC status" });
  }
});

// Get all students for subadmin
app.get("/subadmin/students", async (req, res) => {
  try {
    const students = await User.find({})
      .select("firstName lastName collegeEmail ImageUrl isFrozen kyc")
      .sort({ createdAt: -1 });

    console.log("Fetched students:", students.length);
    students.forEach(student => {
      console.log(`Student: ${student.firstName}, KYC:`, student.kyc);
    });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// Unfreeze a student
app.post("/subadmin/student/:id/unfreeze", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current student before updating
    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find and delete all complaints by this student
    const deleteResult = await Complaint.deleteMany({ userId: id });
    console.log(`Deleted ${deleteResult.deletedCount} complaints for student ${id}`);
    
    // Check KYC status before unfreeze
    if (student.kyc?.status !== "verified") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot unfreeze student! KYC must be verified first. Student's current KYC status: " + (student.kyc?.status || "not submitted")
      });
    }

    // Reset student data for fresh start (but keep KYC)
    const resetData = {
      isFrozen: false,
      walletBalance: 0,
      transactions: [], // Clear all transaction history
      createdAt: new Date(), // Reset registration date to today
      updatedAt: new Date()
    };

    const updatedStudent = await User.findByIdAndUpdate(
      id,
      resetData,
      { new: true }
    );

    // Add notification to student
    await User.findByIdAndUpdate(
      id,
      {
        $push: {
          notifications: {
            message: "Your account has been unfrozen by SubAdmin. You can now use all features.",
            type: "success",
            createdAt: new Date(),
            read: false
          }
        }
      }
    );

    console.log(`Student ${student.firstName} ${student.lastName} unfrozen and completely reset by SubAdmin`);
    console.log(`Previous balance: ${student.walletBalance}, Previous transactions: ${student.transactions.length}`);
    console.log(`KYC status: ${student.kyc?.status} (kept unchanged)`);
    console.log(`New balance: ${updatedStudent.walletBalance}, New transactions: ${updatedStudent.transactions.length}`);
    console.log(`Reset data applied:`, resetData);
    console.log(`Unfreeze notification sent to student.`);

    res.json({ 
      success: true, 
      student: updatedStudent,
      message: "Student unfrozen successfully! All transaction history, complaint history, and registration date have been completely reset for fresh start."
    });
  } catch (err) {
    console.error("Error in unfreeze:", err);
    res.status(500).json({ message: "Failed to unfreeze student" });
  }
});


// Verify/reject student KYC
app.post("/subadmin/student/:id/kyc", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "verified" or "rejected"

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const student = await User.findByIdAndUpdate(
      id,
      { "kyc.status": status },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Add notification to student
    const notificationMessage = status === "verified" 
      ? "Your KYC has been verified by SubAdmin. You can now use all features."
      : "Your KYC has been rejected by SubAdmin. Please contact support for details.";
    
    await User.findByIdAndUpdate(
      id,
      {
        $push: {
          notifications: {
            message: notificationMessage,
            type: status === "verified" ? "success" : "error",
            createdAt: new Date(),
            read: false
          }
        }
      }
    );

    console.log(`KYC ${status} for student ${student.firstName} ${student.lastName}. Notification sent.`);

    res.json({ success: true, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update KYC status" });
  }
});

// Get subadmin profile
app.get("/subadmin/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const subAdmin = await SubAdmin.findById(id).select("name email imageUrl");

    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    res.json(subAdmin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Update subadmin profile
app.put("/subadmin/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl } = req.body;

    const subAdmin = await SubAdmin.findByIdAndUpdate(
      id,
      { name, imageUrl },
      { new: true }
    ).select("name email imageUrl");

    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    res.json({ success: true, subAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

app.post("/complaints", async (req, res) => {
  try {
    const { userId, description, screenshot, admins, role } = req.body;

    // 1️⃣ Generate unique complaint ID
    const randomPart = uuidv4().replace(/-/g, "").substring(0, 5).toUpperCase();
    const complaintId = `cpl${randomPart}`;

    // 2️⃣ Create complaint
    const complaint = await Complaint.create({
      userId,
      complaintId,
      description,
      screenshot,
      assignedAdmins: [], // Initially empty, will populate below
      role,
    });

    // 3️⃣ Assignment logic
    if (role === "vendor") {
      // Vendor complaints go directly to all admins sent from frontend
      await Complaint.findByIdAndUpdate(complaint._id, { isForwarded: true });

      // Assign complaint to selected admins
      if (admins.length > 0) {

        // Also push complaint reference into each Admin's complaints array
        await Admin.updateMany(
          { _id: { $in: admins } },
          { $push: { complaints: complaint._id } }
        );
      }
    } else {
      // Student complaints: assign to **selected admins from frontend**
      if (admins && admins.length > 0) {
        await Complaint.findByIdAndUpdate(complaint._id, {
          $push: { assignedAdmins: { $each: admins } },
        });

        await Admin.updateMany(
          { _id: { $in: admins } },
          { $push: { complaints: complaint._id } }
        );
      } else {
        // Optional fallback: if no admin selected, assign to all SubAdmins
        const subAdmins = await SubAdmin.find({});
        const subAdminIds = subAdmins.map(sa => sa._id);
        await Complaint.findByIdAndUpdate(complaint._id, {
          $push: { assignedAdmins: { $each: subAdminIds } },
        });

        await SubAdmin.updateMany(
          {},
          { $push: { complaints: complaint._id } }
        );
      }
    }

    // 4️⃣ Response
    res.status(201).json({
      success: true,
      complaintId: complaint.complaintId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit complaint" });
  }
});


app.get("/complaints/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching complaints for user:", userId);

    const complaints = await Complaint.find({ userId })
      .lean()
      .sort({ createdAt: -1 });

    // Manually populate assignedAdmins (can be Admin or SubAdmin)
    const populatedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        let assignedPeople = [];
        
        if (complaint.assignedAdmins && complaint.assignedAdmins.length > 0) {
          assignedPeople = await Promise.all(
            complaint.assignedAdmins.map(async (adminId) => {
              // Try to find as Admin first
              let admin = await Admin.findById(adminId).select("email");
              if (admin) {
                return { ...admin.toObject(), type: "Admin" };
              }
              
              // Try to find as SubAdmin
              let subAdmin = await SubAdmin.findById(adminId).select("name email");
              if (subAdmin) {
                return { ...subAdmin.toObject(), type: "SubAdmin" };
              }
              
              return null;
            })
          );
        }
        
        return {
          ...complaint,
          assignedAdmins: assignedPeople.filter(Boolean)
        };
      })
    );

    console.log(`Found ${populatedComplaints.length} complaints for user ${userId}`);
    populatedComplaints.forEach(complaint => {
      console.log(`Complaint: ${complaint.complaintId}, Assigned People: ${complaint.assignedAdmins?.length || 0}`);
      complaint.assignedAdmins?.forEach(person => {
        console.log(`  - ${person.type}: ${person.name || person.email}`);
      });
    });

    res.json({
      success: true,
      complaints: populatedComplaints,
    });
  } catch (err) {
    console.error("Error fetching user complaints:", err);
    res.status(500).json({ message: "Failed to fetch complaint history" });
  }
});

// Admin Dashboard Data Endpoint
app.get("/admin/dashboard", async (req, res) => {
  try {
    console.log("Fetching admin dashboard data...");
    
    // Get counts for dashboard
    const [
      userCount,
      vendorCount,
      subadminCount,
      collegeData
    ] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments(),
      SubAdmin.countDocuments(),
      College.findOne({})
    ]);

    const dashboardData = {
      instituteFunds: collegeData?.amount || 0,
      userCount: userCount,
      vendorCount: vendorCount,
      subadminCount: subadminCount
    };

    console.log("Dashboard data:", dashboardData);
    res.json(dashboardData);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Upload KYC
app.post("/upload-kyc", upload.single("kycImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { role } = req.body;
    console.log("Role in profile upload:", role);
    const kycData = {
      imageUrl: `http://localhost:5000/uploads/${role}/${req.file.filename}`,
      status: "pending",
      submittedAt: new Date(),
    };

    // Send KYC data directly to frontend
    res.json({
      message: "KYC submitted, verification within 48 hours",
      kycData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "KYC upload failed" });
  }
});

app.post("/vendore/profile", async (req, res) => {
  try {
    const { vendorId } = req.body;
    console.log(req.body);
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const vendor = await Vendor.findById(vendorId).select(
      "vendorName Email ImageUrl Wallet isFrozen"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ vendor });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/transactions/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;

    console.log(vendorId);

    const transactions = await Transaction.find({ vendorId })
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName collegeEmail") // get user info including email
      .populate("vendorId", "vendorName"); // get vendor info

    res.json({ success: true, transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/generate-bill/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      username: `${user.firstName} ${user.lastName}`,
      userId: user._id,
      transactions: user.transactions || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error while generating bill",
    });
  }
});

app.post("/info/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      username: user.firstName,
      userId: user._id,
      isFrozen: user.isFrozen,
      imageUrl: user.ImageUrl,
      walletBalance: user.walletBalance,
      userCreatedAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/verify-upin", async (req, res) => {
  try {
    const { userId, upin } = req.body;

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ valid: false, message: "User not found" });
    }

    if (student.Mpin !== upin) {
      return res.status(401).json({ valid: false, message: "Invalid UPIN" });
    }

    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ valid: false });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // ---------------- VALIDATION ----------------
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ---------------- ADMIN ----------------
    if (role === "admin" || role === "Admin") {
      const admin = await Admin.findOne({ email: email });

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (admin.password === password) {
        return res.status(400).json({
          message: "You are entering the same password as before",
        });
      }

      admin.password = password;
      await admin.save();

      return res.status(200).json({
        message: "Password updated successfully",
      });
    }

    // ---------------- SUBADMIN ----------------
    if (role === "SubAdmin" || role === "subadmin") {
      const subAdmin = await SubAdmin.findOne({ email: email });

      if (!subAdmin) {
        return res.status(404).json({ message: "SubAdmin not found" });
      }

      if (subAdmin.password === password) {
        return res.status(400).json({
          message: "You are entering the same password as before",
        });
      }

      subAdmin.password = password;
      await subAdmin.save();

      return res.status(200).json({
        message: "Password updated successfully",
      });
    }

    // ---------------- VENDOR ----------------
    if (role === "vendor") {
      const vendor = await Vendor.findOne({ Email: email });

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      // Check if vendor is suspended
      if (vendor.isSuspended) {
        return res.status(403).json({ 
          message: "Your account has been suspended. You cannot change your password while suspended. Contact admins for assistance." 
        });
      }

      if (vendor.password === password) {
        return res.status(400).json({
          message: "You are entering the same password as before",
        });
      }

      vendor.password = password;
      await vendor.save();

      return res.status(200).json({
        message: "Password updated successfully",
      });
    }

    // ---------------- STUDENT ----------------
    const user = await User.findOne({ collegeEmail: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if student is suspended
    if (user.isSuspended) {
      return res.status(403).json({ 
        message: "Your account has been suspended. You cannot change your password while suspended. Contact admins for assistance." 
      });
    }

    if (user.password === password) {
      return res.status(400).json({
        message: "You are entering the same password as before",
      });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// In-memory store for MPIN OTPs
const mpinOtpStore = {}; // { userId: { otp: '123456', expiresAt: 123456789 } }

// ------------------- SEND MPIN OTP -------------------
app.post("/send-mpin-otp", async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId) return res.status(400).json({ message: "UserId required" });

    if (role === "vendor") {
      const user = await Vendor.findById(userId).select("Email");
      if (!user) return res.status(404).json({ message: "User not found" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      mpinOtpStore[userId] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

      await transporter.sendMail({
        from: process.env.MAIL_USER || "marketiiitdm@gmail.com",
        to: user.Email,
        subject: "MPIN Reset OTP",
        html: `<h2>MPIN Reset Request</h2><p>Your OTP is:</p><h1>${otp}</h1><p>This OTP is valid for 5 minutes.</p>`,
      });

      return res.json({ message: "OTP_SENT" }); // <-- RETURN
    }

    // Regular user
    const user = await User.findById(userId).select("collegeEmail");
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mpinOtpStore[userId] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await transporter.sendMail({
      from: process.env.MAIL_USER || "marketiiitdm@gmail.com",
      to: user.collegeEmail,
      subject: "MPIN Reset OTP",
      html: `<h2>MPIN Reset Request</h2><p>Your OTP is:</p><h1>${otp}</h1><p>This OTP is valid for 5 minutes.</p>`,
    });

    return res.json({ message: "OTP_SENT" }); // <-- RETURN
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send OTP" }); // <-- RETURN
  }
});

// ------------------- RESEND MPIN OTP -------------------
app.post("/resend-mpin-otp", async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId) return res.status(400).json({ message: "UserId required" });

    let userEmail;

    if (role === "vendor") {
      const vendor = await Vendor.findById(userId).select("Email");
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });
      userEmail = vendor.Email;
    } else {
      const user = await User.findById(userId).select("collegeEmail");
      if (!user) return res.status(404).json({ message: "User not found" });
      userEmail = user.collegeEmail;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in-memory with 5-minute expiry
    mpinOtpStore[userId] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    // Send OTP email
    await transporter.sendMail({
      from: process.env.MAIL_USER || "marketiiitdm@gmail.com",
      to: userEmail,
      subject: "Resend MPIN OTP",
      html: `
        <h2>MPIN Reset Request</h2>
        <p>Your new OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    return res.json({ message: "OTP_SENT" }); // <-- ensure only one response
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
});

// ------------------- VERIFY MPIN OTP -------------------
app.post("/verify-mpin-otp", (req, res) => {
  const { userId, otp } = req.body;

  const record = mpinOtpStore[userId];
  if (!record) return res.status(400).json({ message: "Invalid OTP" });

  if (record.expiresAt < Date.now()) {
    delete mpinOtpStore[userId]; // clean up expired OTP
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  res.json({ message: "OTP verified" });
});

// ------------------- RESET MPIN -------------------
app.post("/reset-mpin", async (req, res) => {
  const { userId, mpin, role } = req.body;
  console.log(role);
  if (role == "vendor") {
    const res = await Vendor.findByIdAndUpdate(userId, { Mpin: mpin });
    console.log(res);
  } else await User.findByIdAndUpdate(userId, { Mpin: mpin });

  // Delete OTP after successful reset
  delete mpinOtpStore[userId];

  res.json({ message: "MPIN updated" });
});

const client = new OAuth2Client(
  "299305949480-re6bmtmv7piq101mnt6l6dkanoplpmip.apps.googleusercontent.com"
);

app.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Credential missing" });
    }

    // 🔐 Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const imageUrl = payload.picture;

    // ---------------- CHECK STUDENT ----------------
    const user = await User.findOne({ collegeEmail: email });

    if (user) {
      // Check if student is suspended
      if (user.isSuspended) {
        return res.status(403).json({ 
          error: "Your account has been suspended by the admins/subadmins for fraud actions. You cannot login to your account. Contact admins.",
          isSuspended: true 
        });
      }

      return res.status(200).json({
        exists: true,
        role: "student",
        username: user.firstName || name,
        email: user.collegeEmail,
        userId: user._id,
        imageUrl: user.ImageUrl || imageUrl,
        walletBalance: user.walletBalance || 0,
        isFrozen: user.isFrozen,
        isSuspended: user.isSuspended,
      });
    }

    // ---------------- CHECK VENDOR ----------------
    const vendor = await Vendor.findOne({ Email: email });
    console.log(vendor);
    if (vendor) {
      // Check if vendor is suspended
      if (vendor.isSuspended) {
        return res.status(403).json({ 
          error: "Your account has been suspended by the admins/subadmins for fraud actions. You cannot login to your account. Contact admins.",
          isSuspended: true 
        });
      }

      if (vendor.kyc?.status && vendor.kyc.status !== "success") {
        return res.status(403).json({ error: "KYC not verified" });
      }

      return res.json({
        exists: true,
        role: "vendor",
        vendorName: vendor.vendorName,
        balance: vendor.Wallet,
        imageUrl: vendor.ImageUrl,
        vendorId: vendor._id,
        isSuspended: vendor.isSuspended,
      });
    }

    // ---------------- CHECK SUBADMIN ----------------
    const subAdmin = await SubAdmin.findOne({ email: email });
    
    if (subAdmin) {
      return res.status(200).json({
        exists: true,
        role: "SubAdmin",
        SubAdminName: subAdmin.name,
        email: subAdmin.email,
        imageUrl: subAdmin.imageUrl || imageUrl,
        subAdminId: subAdmin._id,
      });
    }

    // ---------------- CHECK ADMIN ----------------
    const admin = await Admin.findOne({ email: email });
    
    if (admin) {
      return res.status(200).json({
        exists: true,
        role: "admin",
        adminId: admin._id,
        email: admin.email,
        imageUrl: admin.imageUrl || imageUrl,
      });
    }

    // ---------------- NO USER FOUND ----------------
    return res.json({ exists: false });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "firstName lastName ImageUrl isFrozen isSuspended walletBalance"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optional: add a derived status field
  

    res.json({ ...user.toObject()}); // Spread Mongoose doc to plain object and add status
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


// Get all users (for admin freeze functionality)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("firstName lastName collegeEmail isFrozen walletBalance createdAt ImageUrl")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Freeze/unfreeze user
app.put("/user/:userId/freeze", async (req, res) => {
try {
  const { userId } = req.params;
  const { isFrozen } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isFrozen: isFrozen },
    { new: true }
  ).select("firstName lastName collegeEmail isFrozen");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Send notification to user about freeze/unfreeze status
  const notificationMessage = isFrozen 
    ? `Your account has been frozen by Admin. Please contact support for details.`
    : `Your account has been unfrozen by Admin. You can now use all services.`;

  await User.findByIdAndUpdate(userId, {
    $push: {
      notifications: {
        message: notificationMessage,
        type: isFrozen ? "error" : "success",
        createdAt: new Date(),
        read: false
      }
    }
  });

  // Add admin action entry for freeze/unfreeze action
  const actionMessage = isFrozen 
    ? "Account frozen by Admin"
    : "Account unfrozen by Admin";
    
  const actionReason = isFrozen 
    ? "Account frozen due to administrative action"
    : "Account restored - freeze period ended or issue resolved";

  await User.findByIdAndUpdate(userId, {
    $push: {
      adminActions: {
        action: isFrozen ? "freeze" : "unfreeze",
        reason: actionReason,
        performedBy: "admin",
        performedAt: new Date(),
        description: actionMessage
      }
    }
  });

  res.json({
    success: true,
    message: `User ${isFrozen ? 'frozen' : 'unfrozen'} successfully`,
    user
  });
} catch (err) {
  console.error("Error updating user freeze status:", err);
  res.status(500).json({ message: "Failed to update user status" });
}
});

app.post("/update-profile", upload.single("photo"), async (req, res) => {
try {
  const { userId, firstName, lastName, role } = req.body;
    

    if (!userId || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log("Role in update profile:", role);
    const updateData = {
      firstName,
      lastName,
    };

    // If user uploaded a new photo
    if (req.file) {
      updateData.ImageUrl = `http://localhost:5000/uploads/${role}/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      imageUrl: updatedUser.ImageUrl,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

function generateTxnId(length = 9) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return "txn" + result; // total length = 3 + length
}

app.post("/redeem/request", async (req, res) => {
  try {
    const { userId, amount, mpin } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "userId and amount required" });
    }

    // Get current vendor wallet balance
    const vendor = await Vendor.findById(userId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    if (vendor.Mpin != mpin) {
      return res.status(400).json({ error: "Invalid Mpin" });
    }
    if (amount <= 0 || amount > vendor.Wallet) {
      return res.status(400).json({ error: "Invalid redeem amount" });
    }

    // 1️⃣ Create redeem request
    const redeem = new Redeem({
      userId,
      amount,
      closingBalance: vendor.Wallet - amount,
      status: "PENDING",
      Ifsc : vendor.Ifsc,
      Acc : vendor.Acc
    });

    await redeem.save();

    // 2️⃣ Update vendor wallet balance immediately
    vendor.Wallet -= amount;
    await vendor.save();

    res.json({
      message: "Redeem request submitted successfully",
      redeem,
      remainingBalance: vendor.Wallet,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/transaction/verify-qr", async (req, res) => {
  try {
    const { txid } = req.body;

    if (!txid) {
      return res.status(400).json({ error: "Transaction ID required" });
    }

    // 1️⃣ Find transaction
    const txn = await Transaction.findOne({ txid });

    if (!txn) {
      return res
        .status(404)
        .json({ error: "Invalid QR / Transaction not found" });
    }

    // 2️⃣ Status check
    if (txn.status !== "PENDING") {
      return res.status(400).json({
        error: `Transaction already ${txn.status}`,
      });
    }

    // 3️⃣ Expiry check
    if (txn.expiresAt && txn.expiresAt < new Date()) {
      txn.status = "EXPIRED";
      await txn.save();

      return res.status(400).json({ error: "QR expired" });
    }

    // 4️⃣ Valid QR
    res.json({
      valid: true,
      txid: txn.txid,
      vendorId: txn.vendorId,
      amount: txn.amount,
      expiresAt: txn.expiresAt,
    });
  } catch (err) {
    console.error("Verify QR error:", err);
    res.status(500).json({ error: "QR verification failed" });
  }
});

app.put(
  "/vendor/update-profile/:vendorId",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);
      const { vendorId } = req.params;
      const vendor = await Vendor.findById(req.params.vendorId);

      console.log(vendor);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      if (req.body.vendorName?.trim()) {
        vendor.vendorName = req.body.vendorName;
      }

      if (req.file) {
        vendor.ImageUrl = `http://localhost:5000/uploads/vendorpics/${req.file.filename}`;
      }

      await vendor.save();

      res.json({
        message: "Profile updated successfully",
        vendor,
      });
    } catch (err) {
      console.error("Vendor update error:", err);
      res.status(500).json({ error: "Profile update failed" });
    }
  }
);

app.get("/notifications", async (req, res) => {
  const { role } = req.query; // STUDENT / VENDOR / SUBADMIN
  try {
    const notifications = await Notification.find({
      $or: [
        { role: "ALL" },
        { role: role?.toUpperCase() },
      ],
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch notifications" });
  }
});

app.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  const { role } = req.query; // STUDENT / VENDOR / SUBADMIN
  console.log(role)
  try {
    // Get global notifications
    const globalNotifications = await Notification.find({
      $or: [
        { role: "ALL" },
        { role: role.toUpperCase() },
      ],
    }).sort({ createdAt: -1 });

    // Mark unread per user for global notifications
    const globalWithReadStatus = globalNotifications.map((n) => ({
      ...n.toObject(),
      read: n.readBy.map((id) => id.toString()).includes(userId),
    }));

    let personalNotifications = [];

    // Get personal notifications based on role
    if (role === "student") {
      const user = await User.findById(userId).select("notifications");
      if (user) {
        personalNotifications = user.notifications || [];
      }
    } else if (role === "vendor") {
      const vendor = await Vendor.findById(userId).select("notifications");
      if (vendor) {
        personalNotifications = vendor.notifications || [];
      }
    } else if (role === "subadmin") {
      const subAdmin = await SubAdmin.findById(userId).select("notifications");
      if (subAdmin) {
        personalNotifications = subAdmin.notifications || [];
      }
    }

    // Combine and sort all notifications by createdAt (newest first)
    const allNotifications = [
      ...globalWithReadStatus,
      ...personalNotifications.map(n => {
        console.log("Personal notification structure:", n);
        return {
          _id: n._id,
          message: n.message,
          title: n.type === "success" ? "Success" :
                  n.type === "error" ? "Error" :
                  n.type === "warning" ? "Warning" : "Info",
          read: n.read,
          createdAt: n.createdAt,
          type: n.type
        };
      })
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("Total notifications:", allNotifications.length);
    console.log("Personal notifications:", personalNotifications.length);

    res.json(allNotifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ msg: "Failed to fetch notifications" });
  }
});


app.post("/notifications/read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, role } = req.body; // <-- pass current user ID and role from frontend

    if (!userId) return res.status(400).json({ message: "userId required" });

    // First try to find it in global notifications
    const globalNotification = await Notification.findById(notificationId);
    if (globalNotification) {
      // Add current user to readBy array (avoid duplicates by comparing strings)
      const alreadyRead = (globalNotification.readBy || []).some((id) => id.toString() === userId);
      if (!alreadyRead) {
        if (mongoose.Types.ObjectId.isValid(userId)) {
          globalNotification.readBy.push(new mongoose.Types.ObjectId(userId));
        } else {
          globalNotification.readBy.push(userId);
        }
        await globalNotification.save();
      }

      const updated = globalNotification.toObject();
      updated.read = (updated.readBy || []).map((id) => id.toString()).includes(userId);

      res.json({ message: "Notification marked as read", notification: updated });
      return;
    }

    // If not found in global, try personal notifications based on role
    if (role === "student") {
      await User.updateOne(
        { _id: userId, "notifications._id": notificationId },
        { $set: { "notifications.$.read": true } }
      );
    } else if (role === "vendor") {
      await Vendor.updateOne(
        { _id: userId, "notifications._id": notificationId },
        { $set: { "notifications.$.read": true } }
      );
    } else if (role === "subadmin") {
      await SubAdmin.updateOne(
        { _id: userId, "notifications._id": notificationId },
        { $set: { "notifications.$.read": true } }
      );
    }

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Compatibility route: allow POST /notifications/:notificationId/read (frontend uses this)
app.post("/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, role } = req.body;

    if (!userId) return res.status(400).json({ message: "userId required" });
    if (!notificationId || notificationId === "undefined") {
      console.log("Mark read (compat) error: Invalid notificationId", notificationId);
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    // First try to find it in global notifications
    const notification = await Notification.findById(notificationId);
    if (notification) {
      console.log("POST /notifications/:id/read ->", { notificationId, userId, existingReadBy: notification.readBy });

      const alreadyRead = (notification.readBy || []).some((id) => id.toString() === userId);
      if (!alreadyRead) {
        if (mongoose.Types.ObjectId.isValid(userId)) {
          notification.readBy.push(new mongoose.Types.ObjectId(userId));
        } else {
          notification.readBy.push(userId);
        }
        await notification.save();
      }

      const updated = notification.toObject();
      updated.read = (updated.readBy || []).map((id) => id.toString()).includes(userId);

      res.json({ message: "Notification marked as read", notification: updated });
      return;
    }

    // If not found in global, try personal notifications based on role
    if (role === "student") {
      await User.updateOne(
        { _id: userId, "notifications._id": notificationId },
        { $set: { "notifications.$.read": true } }
      );
    } else if (role === "vendor") {
      await Vendor.updateOne(
        { _id: userId, "notifications._id": notificationId },
        { $set: { "notifications.$.read": true } }
      );
    } else if (role === "subadmin") {
      await SubAdmin.updateOne(
        { _id: userId, "notifications._id": notificationId },
        { $set: { "notifications.$.read": true } }
      );
    }

    console.log("Marked personal notification as read:", { notificationId, userId, role });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark read (compat) error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/vendor/qr-status/:qrId", async (req, res) => {
  const { qrId } = req.params;

  // Validate qrId
  if (!qrId) return res.status(400).json({ error: "QR ID required" });
  if (!mongoose.Types.ObjectId.isValid(qrId))
    return res.status(400).json({ error: "Invalid QR ID" });

  try {
    const transaction = await Transaction.findById(qrId);
    if (!transaction) return res.status(404).json({ error: "QR not found" });

    // Auto-expire if past expiry
    if (
      transaction.status === "PENDING" &&
      transaction.expiresAt < new Date()
    ) {
      transaction.status = "EXPIRED";
      await transaction.save();
    }

    res.json({ status: transaction.status });
  } catch (err) {
    console.error("Error fetching QR status:", err);
    res.status(500).json({ error: "Failed to get QR status" });
  }
});
// Cancel QR manually
app.post("/vendor/cancel-qr/:qrId", async (req, res) => {
  const { qrId } = req.params;
  console.log(qrId);
  // validate ObjectId
  if (!qrId) {
    return res.status(400).json({ error: "Invalid QR ID" });
  }

  try {
    const transaction = await Transaction.findById(qrId);
    if (!transaction) return res.status(404).json({ error: "QR not found" });

    if (transaction.status === "PENDING") {
      transaction.status = "FAILED";
      await transaction.save();
    }

    res.json({ message: "QR cancelled" });
  } catch (err) {
    console.error("Cancel QR error:", err);
    res.status(500).json({ error: "Failed to cancel QR" });
  }
});

app.post("/amount/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    console.log(vendor.Wallet);

    res.status(200).json({
      totalAmount: vendor.Wallet, // or whatever field you store
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/refund", async (req, res) => {
  const { email, vendorId, amount, mpin } = req.body;

  if (!email || !vendorId || !amount || !mpin) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Find vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    if (vendor.Mpin !== mpin) {
      return res.status(400).json({ msg: "Wrong MPIN entered" });
    }
    const updated = notification.toObject();
    updated.read = (updated.readBy || []).map((id) => id.toString()).includes(userId);

    res.json({ message: "Notification marked as read", notification: updated });
    vendor.Wallet -= amount;

    // Add amount to college balance
    const college = await College.findOne();
    if (!college) return res.status(404).json({ msg: "College not found" });
    college.amount += amount;

    // Deduct amount from student wallet
    user.walletBalance -= amount;

    // Create transaction
    const tx = new Transaction({
      txid: new mongoose.Types.ObjectId(),
      userId: user._id,
      vendorId: vendor._id,
      amount,
      status: "REFUND",
      completedAt: new Date(),
    });

    // Save transaction references
    user.transactions.push(tx);

    // Add to college transactions
    college.transactions.push({
      studentId: user._id,
      studentName: user.firstName + " " + user.lastName,
      amount,
      category: "Refund",
      txid: tx._id.toString(),
      vendorid: vendor._id.toString(),
      status: "REFUND",
    });

    // Save all
    await Promise.all([user.save(), vendor.save(), college.save(), tx.save()]);

    res.status(200).json({ msg: "Refund successful", transactionId: tx._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

app.post("/vn", async (req, res) => {
  const { txid } = req.body;
  if (!txid) return res.status(400).json({ msg: "txid required" });

  const transaction = await Transaction.findOne({ txid });
  if (!transaction) return res.status(404).json({ msg: "Transaction not found" });
  
  const vendorData = await Vendor.findById(transaction.vendorId );
  console.log(vendorData.vendorName)
  if (!vendorData) return res.status(404).json({ msg: "Vendor not found" });

  res.json(vendorData.vendorName);
});

app.get("/admin/redeem-requests", async (req, res) => {
  try {
    const redeems = await Redeem.find({ status: "PENDING" })
      .populate("userId", "vendorName Email")
      .sort({ date: -1 });

    res.json(redeems);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch redeems" });
  }
});

// admin approve / reject redeem
app.post("/admin/redeem/update-status", async (req, res) => {
  console.log("Request received:", req.body);
  const { redeemId, status } = req.body;
  console.log("Received redeem update request:", { redeemId, status });
  if (!["SUCCESS", "FAILED"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status" });
  }

  try {
    // Get the redeem request details before updating
    const redeem = await Redeem.findById(redeemId).populate('userId', 'vendorName Email');
    
    if (!redeem) {
      return res.status(404).json({ msg: "Redeem request not found" });
    }

    console.log(`Processing redeem: ID=${redeemId}, Amount=${redeem.amount}, Status=${status}`);
    console.log(`Vendor: ID=${redeem.userId._id}, Name=${redeem.userId.vendorName}`);
    
    // Convert scientific notation to regular number for display
    const displayAmount = redeem.amount.toExponential(2) === redeem.amount.toString() 
      ? redeem.amount.toPrecision(8) 
      : redeem.amount.toString();
    
    console.log(`Display amount: ${displayAmount}`);

    // Update redeem status FIRST (this always happens)
    await Redeem.updateOne(
      { _id: redeemId },
      { $set: { status } }
    );

    console.log(`Redeem status updated to: ${status}`);

    // THEN handle notifications and wallet updates based on status
    if (status === "SUCCESS") {
      await Vendor.findByIdAndUpdate(
        redeem.userId._id,
        {
          $push: {
            notifications: {
              message: `Your redeem request of ₹${displayAmount} has been approved and processed successfully by Admin.`,
              type: "success",
              createdAt: new Date(),
              read: false
            }
          }
        }
      );

      console.log(`Redeem ${redeemId} approved by Admin. Notification sent to vendor ${redeem.userId.vendorName}.`);
    } else if (status === "FAILED") {
      // Refund the amount back to vendor's wallet when rejected
      console.log(`Refunding amount: ${redeem.amount} to vendor wallet`);
      
      const updateResult = await Vendor.findByIdAndUpdate(
        redeem.userId._id,
        {
          $inc: { Wallet: redeem.amount }, // Add money back to wallet
          $push: {
            notifications: {
              message: `Your redeem request of ₹${displayAmount} has been rejected by Admin. The amount has been refunded to your wallet. Please contact support for details.`,
              type: "error",
              createdAt: new Date(),
              read: false
            }
          }
        }
      );

      console.log(`Wallet update result:`, updateResult);
      console.log(`Redeem ${redeemId} rejected by Admin. ₹${displayAmount} refunded to vendor ${redeem.userId.vendorName}. Notification sent.`);
    }

    res.json({ msg: `Redeem ${status}` });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update redeem status" });
  }
});


// Get notifications for user
app.get("/user/:userId/notifications", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("notifications");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sort notifications by createdAt descending (newest first)
    const notifications = user.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ notifications });
  } catch (err) {
    console.error("Error fetching user notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark notification as read for user
app.put("/user/:userId/notifications/:notificationId/read", async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    
    await User.updateOne(
      { _id: userId, "notifications._id": notificationId },
      { $set: { "notifications.$.read": true } }
    );
    
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// Get notifications for vendor
app.get("/vendor/:vendorId/notifications", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await Vendor.findById(vendorId).select("notifications");
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Sort notifications by createdAt descending (newest first)
    const notifications = vendor.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ notifications });
  } catch (err) {
    console.error("Error fetching vendor notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark notification as read for vendor
app.put("/vendor/:vendorId/notifications/:notificationId/read", async (req, res) => {
  try {
    const { vendorId, notificationId } = req.params;
    
    await Vendor.updateOne(
      { _id: vendorId, "notifications._id": notificationId },
      { $set: { "notifications.$.read": true } }
    );
    
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// Get notifications for subadmin
app.get("/subadmin/:subAdminId/notifications", async (req, res) => {
  try {
    const { subAdminId } = req.params;
    const subAdmin = await SubAdmin.findById(subAdminId).select("notifications");
    
    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    // Sort notifications by createdAt descending (newest first)
    const notifications = subAdmin.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ notifications });
  } catch (err) {
    console.error("Error fetching subadmin notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark notification as read for subadmin
app.put("/subadmin/:subAdminId/notifications/:notificationId/read", async (req, res) => {
  try {
    const { subAdminId, notificationId } = req.params;
    
    await SubAdmin.updateOne(
      { _id: subAdminId, "notifications._id": notificationId },
      { $set: { "notifications.$.read": true } }
    );
    
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});


// Migration: Add notifications field to existing vendors without it
app.post("/migrate-vendor-notifications", async (req, res) => {
  try {
    const result = await Vendor.updateMany(
      { notifications: { $exists: false } },
      { $set: { notifications: [] } }
    );
    
    res.json({ 
      message: `Updated ${result.modifiedCount} vendors with notifications field`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ message: "Migration failed" });
  }
});

app.post("/migrate-user-notifications", async (req, res) => {
  try {
    const result = await User.updateMany(
      { notifications: { $exists: false } },
      { $set: { notifications: [] } }
    );
    
    res.json({ 
      message: `Updated ${result.modifiedCount} users with notifications field`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ message: "Migration failed" });
  }
});

app.post("/migrate-subadmin-notifications", async (req, res) => {
  try {
    const result = await SubAdmin.updateMany(
      { notifications: { $exists: false } },
      { $set: { notifications: [] } }
    );
    
    res.json({ 
      message: `Updated ${result.modifiedCount} subadmins with notifications field`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ message: "Migration failed" });
  }
});


// Monitor vendors - get all vendor activity and details
app.get("/admin/monitor/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({})
      .select("vendorName Email vendorid kyc ImageUrl Wallet createdAt isFrozen isSuspended")
      .sort({ createdAt: -1 });

    // Get additional stats for each vendor
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const redeemRequests = await Redeem.find({ userId: vendor._id })
          .sort({ date: -1 })
          .limit(5);
        
        const transactions = await Transaction.find({ vendorId: vendor._id })
          .sort({ createdAt: -1 })
          .limit(5);

        return {
          ...vendor.toObject(),
          recentRedeems: redeemRequests,
          recentTransactions: transactions,
          totalRedeems: redeemRequests.length,
          totalTransactions: transactions.length
        };
      })
    );

    res.json(vendorsWithStats);
  } catch (err) {
    console.error("Error fetching vendor monitor data:", err);
    res.status(500).json({ message: "Failed to fetch vendor data" });
  }
});

// Monitor students - get all student activity and details
app.get("/admin/monitor/students", async (req, res) => {
  try {
    const students = await User.find({})
      .select("firstName lastName collegeEmail ImageUrl isFrozen isSuspended walletBalance createdAt kyc")
      .sort({ createdAt: -1 });

    // Get additional stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const transactions = student.transactions || [];
        const complaints = await Complaint.find({ userId: student._id })
          .sort({ createdAt: -1 })
          .limit(5);

        // Calculate total spending from successful transactions
        const totalSpending = transactions
          .filter(tx => tx.status === "SUCCESS")
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        return {
          ...student.toObject(),
          recentTransactions: transactions.slice(-5), // Last 5 transactions
          recentComplaints: complaints,
          totalTransactions: transactions.length,
          totalComplaints: complaints.length,
          totalSpending: totalSpending
        };
      })
    );

    res.json(studentsWithStats);
  } catch (err) {
    console.error("Error fetching student monitor data:", err);
    res.status(500).json({ message: "Failed to fetch student data" });
  }
});

// Get detailed vendor activity
app.get("/admin/monitor/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await Vendor.findById(vendorId)
      .select("vendorName Email vendorid kyc ImageUrl Wallet createdAt isFrozen");
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const redeemRequests = await Redeem.find({ userId: vendorId })
      .sort({ date: -1 });
    
    const transactions = await Transaction.find({ vendorId: vendorId })
      .populate("userId", "firstName lastName collegeEmail")
      .sort({ createdAt: -1 });

    res.json({
      vendor,
      redeemRequests,
      transactions,
      stats: {
        totalRedeems: redeemRequests.length,
        totalTransactions: transactions.length,
        successfulTransactions: transactions.filter(t => t.status === "SUCCESS").length,
        totalRedeemAmount: redeemRequests.reduce((sum, r) => sum + r.amount, 0)
      }
    });
  } catch (err) {
    console.error("Error fetching vendor details:", err);
    res.status(500).json({ message: "Failed to fetch vendor details" });
  }
});

// Get detailed student activity
app.get("/admin/monitor/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId)
      .select("firstName lastName collegeEmail ImageUrl isFrozen walletBalance createdAt kyc");
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const complaints = await Complaint.find({ userId: studentId })
      .sort({ createdAt: -1 });

    // Calculate total spending from successful transactions
    const transactions = student.transactions || [];
    const totalSpending = transactions
      .filter(tx => tx.status === "SUCCESS")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    res.json({
      student,
      transactions: transactions,
      complaints,
      stats: {
        totalTransactions: transactions.length,
        totalComplaints: complaints.length,
        totalSpending: totalSpending,
        walletBalance: student.walletBalance
      }
    });
  } catch (err) {
    console.error("Error fetching student details:", err);
    res.status(500).json({ message: "Failed to fetch student details" });
  }
});

// Freeze/unfreeze vendor from monitor
app.put("/admin/monitor/vendor/:vendorId/freeze", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { isFrozen } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isFrozen: isFrozen },
      { new: true }
    ).select("vendorName Email isFrozen");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Send notification to vendor about freeze/unfreeze status
    const notificationMessage = isFrozen 
      ? `Your account has been frozen by Admin. Please contact support for details.`
      : `Your account has been unfrozen by Admin. You can now use all services.`;

    await Vendor.findByIdAndUpdate(vendorId, {
      $push: {
        notifications: {
          message: notificationMessage,
          type: isFrozen ? "error" : "success",
          createdAt: new Date(),
          read: false
        }
      }
    });

    // Add admin action entry for freeze/unfreeze action
    const actionMessage = isFrozen 
      ? "Account frozen by Admin"
      : "Account unfrozen by Admin";
      
    const actionReason = isFrozen 
      ? "Account frozen due to administrative action"
      : "Account restored - freeze period ended or issue resolved";

    await Vendor.findByIdAndUpdate(vendorId, {
      $push: {
        adminActions: {
          action: isFrozen ? "freeze" : "unfreeze",
          reason: actionReason,
          performedBy: "admin",
          performedAt: new Date(),
          description: actionMessage
        }
      }
    });

    res.json({
      success: true,
      message: `Vendor ${isFrozen ? 'frozen' : 'unfrozen'} successfully`,
      vendor
    });
  } catch (err) {
    console.error("Error updating vendor freeze status:", err);
    res.status(500).json({ message: "Failed to update vendor status" });
  }
});

// Migration: Add vendorid to existing vendors without it
app.post("/migrate-vendor-ids", async (req, res) => {
  try {
    const vendors = await Vendor.find({ vendorid: { $exists: false } });
    
    for (const vendor of vendors) {
      const vendorid = `vdr${nanoid(4)}`;
      await Vendor.findByIdAndUpdate(vendor._id, { vendorid });
      console.log(`Added vendorid ${vendorid} to vendor ${vendor.vendorName}`);
    }
    
    res.json({ 
      message: `Added vendorid to ${vendors.length} vendors`,
      updatedCount: vendors.length
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ message: "Migration failed" });
  }
});

// Approve/reject student KYC
app.put("/admin/monitor/student/:studentId/kyc", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid KYC status" });
    }

    const student = await User.findByIdAndUpdate(
      studentId,
      { 
        "kyc.status": status,
        "kyc.rejectionReason": rejectionReason || "",
        "kyc.reviewedAt": new Date(),
        "kyc.reviewedBy": "admin"
      },
      { new: true }
    ).select("firstName lastName kyc");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Send notification to student about KYC status
    const notificationMessage = status === "verified" 
      ? `Your KYC has been verified successfully by Admin.`
      : `Your KYC has been rejected by Admin. Reason: ${rejectionReason || "Not specified"}`;

    await User.findByIdAndUpdate(studentId, {
      $push: {
        notifications: {
          message: notificationMessage,
          type: status === "verified" ? "success" : "error",
          createdAt: new Date(),
          read: false
        }
      }
    });

    res.json({
      success: true,
      message: `Student KYC ${status} successfully`,
      student
    });
  } catch (err) {
    console.error("Error updating student KYC:", err);
    res.status(500).json({ message: "Failed to update student KYC" });
  }
});

// Suspend/unsuspend student
app.put("/admin/monitor/student/:studentId/suspend", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { isSuspended, reason } = req.body;

    const student = await User.findByIdAndUpdate(
      studentId,
      { isSuspended: isSuspended },
      { new: true }
    ).select("firstName lastName collegeEmail isSuspended");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Add admin action entry for suspend/unsuspend action
    const actionMessage = isSuspended 
      ? "Account suspended by Admin/SubAdmin"
      : "Account suspension lifted by Admin/SubAdmin";
      
    const actionReason = reason || (isSuspended 
      ? "Account suspended due to fraud activities"
      : "Suspension period ended or issue resolved");

    await User.findByIdAndUpdate(studentId, {
      $push: {
        adminActions: {
          action: isSuspended ? "suspend" : "unsuspend",
          reason: actionReason,
          performedBy: "admin",
          performedAt: new Date(),
          description: actionMessage
        }
      }
    });

    res.json({
      success: true,
      message: `Student ${isSuspended ? 'suspended' : 'unsuspended'} successfully`,
      student
    });
  } catch (err) {
    console.error("Error updating student suspend status:", err);
    res.status(500).json({ message: "Failed to update student suspend status" });
  }
});

// Suspend/unsuspend vendor
app.put("/admin/monitor/vendor/:vendorId/suspend", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { isSuspended, reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isSuspended: isSuspended },
      { new: true }
    ).select("vendorName Email isSuspended");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Add admin action entry for suspend/unsuspend action
    const actionMessage = isSuspended 
      ? "Vendor account suspended by Admin/SubAdmin"
      : "Vendor account suspension lifted by Admin/SubAdmin";
      
    const actionReason = reason || (isSuspended 
      ? "Vendor account suspended due to fraud activities"
      : "Suspension period ended or issue resolved");

    await Vendor.findByIdAndUpdate(vendorId, {
      $push: {
        adminActions: {
          action: isSuspended ? "suspend" : "unsuspend",
          reason: actionReason,
          performedBy: "admin",
          performedAt: new Date(),
          description: actionMessage
        }
      }
    });

    res.json({
      success: true,
      message: `Vendor ${isSuspended ? 'suspended' : 'unsuspended'} successfully`,
      vendor
    });
  } catch (err) {
    console.error("Error updating vendor suspend status:", err);
    res.status(500).json({ message: "Failed to update vendor suspend status" });
  }
});

// Get admin actions for a user (student or vendor)
app.get("/admin-actions/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;
    
    let user;
    if (role === "student") {
      user = await User.findById(userId).select("adminActions firstName lastName collegeEmail");
    } else if (role === "vendor") {
      user = await Vendor.findById(userId).select("adminActions vendorName Email");
    } else {
      return res.status(400).json({ message: "Invalid role. Must be 'student' or 'vendor'" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      adminActions: user.adminActions || [],
      userInfo: {
        name: role === "student" ? `${user.firstName} ${user.lastName}` : user.vendorName,
        email: role === "student" ? user.collegeEmail : user.Email,
        role: role
      }
    });
  } catch (err) {
    console.error("Error fetching admin actions:", err);
    res.status(500).json({ message: "Failed to fetch admin actions" });
  }
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
