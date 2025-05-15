const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4500;

app.use(cors());
app.use(express.json());

// Cấu hình transporter cho nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nguyentruong2792004t@gmail.com',
    pass: 'njvs exdj gddf scfw'
  }
});

// API endpoint để gửi email
app.post('/send-email', async (req, res) => {
  const { userEmail, orderDetails, totalAmount, orderId } = req.body;

  const orderDetailUrl = `http://localhost:3000/orders/${orderId}`;

  const mailOptions = {
    from: 'nguyentruong2792004t@gmail.com',
    to: userEmail,
    subject: 'Xác nhận đơn hàng - Alistyle Perfume',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Cảm ơn bạn đã đặt hàng tại Alistyle Perfume!</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="color: #28a745; font-size: 18px; text-align: center;">Đơn hàng của bạn đã được xác nhận thành công!</p>
          
          <div style="border-top: 2px solid #dee2e6; border-bottom: 2px solid #dee2e6; padding: 15px 0; margin: 15px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Chi tiết đơn hàng:</h3>
            <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> #${orderId}</p>
            <p style="margin: 5px 0;"><strong>Tổng giá trị:</strong> ${totalAmount.toLocaleString('vi-VN')} VNĐ</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${orderDetailUrl}" 
               style="background-color: #007bff; 
                      color: white; 
                      padding: 12px 25px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold;
                      display: inline-block;">
              Xem chi tiết đơn hàng của bạn
            </a>
          </div>

          <p style="color: #666; font-style: italic; text-align: center;">
            Chúng tôi sẽ sớm xử lý đơn hàng của bạn.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
          <p>© 2024 Thế giới skincare Suong Suong. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email đã được gửi thành công' });
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi gửi email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
}); 