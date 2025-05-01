const htmlEmailVerify = async(generateOTP, duration = 10) => {
    return `
                <div style="
                    font-family: Arial, sans-serif;
                    background-image: url('https://lh3.google.com/u/0/d/1fiY8eqCI-hHPCEhCEuCgAIQMEktyXk3d=w1920-h945-iv1?auditContext=prefetch');
                    background-size: cover;
                    background-position: center;
                    padding: 30px;
                    border-radius: 8px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                ">

                    <h3 style="color:rgb(255, 255, 255); text-align: center; font-size: 30px; margin: 20px 0px">Welcome to Astrolingo!</h3>

                    <!-- Mascot Image -->
                    <div style="text-align: center; width: 300px; height: 300px; margin: 0 auto 20px auto;">
                        <img src="https://lh3.google.com/u/0/d/1zcCP4ukkrRWKQzbFA8F-uC37CwJekb1t=w1365-h945-iv1?auditContext=prefetch"
                            alt="Astrolingo Mascot"
                            style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);"/>
                    </div>

                    <p style="font-size: 16px; color: rgb(245, 245, 245); line-height: 1.6; text-align: center;">
                        Hello, we received a request to send you an OTP. Please use the code below to verify your account.
                    </p>

                    <div style="background-color: #fff; padding: 20px; text-align: center; border-radius: 6px; margin-top: 20px;">
                        <p style="font-size: 40px; color: #FF5733; font-weight: bold; letter-spacing: 5px; margin: 0;">
                            ${generateOTP}
                        </p>
                        <p style="font-size: 18px; color: #333; margin-top: 20px;">
                            This code <b>expires in ${duration} minute(s)</b>.
                        </p>
                    </div>

                    <div style="margin-top: 30px; text-align: center; font-size: 14px; color: rgb(240, 240, 240);">
                        <p>&copy; 2025 Astrolingo. All rights reserved.</p>
                    </div>
                </div> 
            `
};

module.exports = htmlEmailVerify;