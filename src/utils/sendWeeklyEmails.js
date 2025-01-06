const nodemailer = require("nodemailer");
const Subscription = require("../resources/subscription/subscriptionModel");
const Client = require("../resources/clients/clientModel");
const AdminUser = require("../resources/adminUser/adminUserModel");

const transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    secure: true,
    auth: {
        user: process.env.MAILFROM,
        pass: process.env.MAILPASS,
    },
});

const emailTemplates = {
    Silver: [
        {
            week: 1,
            subject: "Check-in - How's the New Fitness Program Going?",
            message: (name, adminName) => `
                Hi ${name}, I hope you had a great start to the week. I wanted to check in and see how the new fitness program is going for you.
                Are you finding it easy to stick to the routine we discussed? If you have any questions or need any help making adjustments, please let me know.
                I'm here to support you and your goals! Thanks, ${adminName}
            `
        },
        {
            week: 2,
            subject: "Check-in - Have You Hit Any Roadblocks?",
            message: (name, adminName) => `
                Hi ${name}, I hope your week two of the fitness program is going as great as week one. I wanted to check in and see if you have run into any roadblocks.
                If there is anything I can do to help you get back on track, please let me know. I'm here to support you and your goals! Thanks, ${adminName}
            `
        },
        {
            week: 3,
            subject: "Check-in - Celebrate Your Successes!",
            message: (name, adminName) => `
                Hi ${name}, We're at the halfway point in your fitness program and I wanted to check in and see how you're doing.
                Have you seen any progress? I'm sure you've accomplished a lot in the last two weeks. Thanks, ${adminName}
            `
        },
        {
            week: 4,
            subject: "Check-in - Final Week of Your Fitness Program",
            message: (name, adminName) => `
                Hi ${name}, We're in the final week of your fitness program and I wanted to check in and see how you're feeling.
                Are you seeing the results you were hoping for? I'm here to support you. Thanks, ${adminName}
            `
        },
    ],
    Gold: [
        {
            week: 1,
            subject: "Ready to get moving?",
            message: (name, adminName) => `
            Hi ${name},
            Welcome to your 8-week online fitness coaching program! I'm so excited to have you on board and I'm looking forward to helping you reach your fitness goals. To get us started, please take a few moments to answer the following questions:

            1. What motivated you to join this program?
            2. What are your fitness goals?
            3. What do you think will be the biggest challenge for you during this program?

            Once you've answered these questions, please reply to this email with your responses. I'll be in touch soon to discuss your answers and review the program's expectations.
            Talk soon, ${adminName}
        `
        },
        {
            week: 2,
            subject: "Let's get started",
            message: (name, adminName) => `
            Hi ${name},
            I hope you had a chance to answer the questions I sent last week and that you're ready to get started. In this week's check-in, I'd like to review the expectations for the program and discuss any questions you have. Please take a few moments to review the program expectations and let me know if you have any questions or concerns.
            I'm looking forward to discussing the program in more detail and helping you reach your fitness goals.
            Talk soon, ${adminName}
        `
        },
        {
            week: 3,
            subject: "How are you doing?",
            message: (name, adminName) => `
            Hi ${name},
            It's been two weeks since we started your 8-week online fitness coaching program, and I'm wondering how you're doing. Please take a few moments to answer the following questions:

            1. How have you been feeling since we started the program?
            2. Are there any areas that you would like to focus on?
            3. What do you think has been the most challenging part of the program so far?

            Once you've answered these questions, please reply to this email with your responses. I'll be in touch soon to discuss your answers and provide any support you may need.
            Talk soon, ${adminName}
        `
        },
        {
            week: 4,
            subject: "Halfway there!",
            message: (name, adminName) => `
            Hi ${name},
            It's already been four weeks since we started your 8-week online fitness coaching program, and you're halfway there! I'm sure you're feeling great about what you've accomplished so far, and I'm proud of you for making it this far. Please take a few moments to answer the following questions:

            1. What do you think has been the biggest success of the program so far?
            2. Are there any areas that you would like to focus on in the next four weeks?
            3. What do you think has been the most rewarding part of the program?

            Once you've answered these questions, please reply to this email with your responses. I'll be in touch soon to discuss your answers and provide any support you may need.
            Talk soon, ${adminName}
        `
        },
        {
            week: 5,
            subject: "Keep up the great work!",
            message: (name, adminName) => `
            Hi ${name},
            It's been five weeks since we started your 8-week online fitness coaching program, and I'm sure you're feeling great about the progress you've made. Keep up the great work and stay motivated! Please take a few moments to answer the following questions:

            1. What do you think has been the most difficult part of the program so far?
            2. Are there any areas that you would like to focus on in the next three weeks?
            3. What do you think has been the most rewarding part of the program?

            Once you've answered these questions, please reply to this email with your responses. I'll be in touch soon to discuss your answers and provide any support you may need.
            Talk soon, ${adminName}
        `
        },
        {
            week: 6,
            subject: "Check in to stay on track",
            message: (name, adminName) => `
            Hi ${name},
            It's been six weeks since we started your 8-week online fitness coaching program, and I'm sure you're feeling great about the progress you've made. Let's check in to make sure you're staying on track. Please take a few moments to answer the following questions:

            1. Are you feeling motivated and energized?
            2. What do you think has been the most difficult part of the program so far?
            3. Are there any areas that you would like to focus on in the next two weeks?

            Once you've answered these questions, please reply to this email with your responses. I'll be in touch soon to discuss your answers and provide any support you may need.
            Talk soon, ${adminName}
        `
        },
        {
            week: 7,
            subject: "One week to go!",
            message: (name, adminName) => `
            Hi ${name},
            You're almost at the end of your 8-week online fitness coaching program! I'm sure you're feeling great about the progress you've made. Let's check in to make sure you're staying on track for the final week. Please take a few moments to answer the following questions:

            1. Are you feeling motivated and energized?
            2. What do you think has been the most rewarding part of the program?
            3. Are there any areas that you would like to focus on in the final week?

            Once you've answered these questions, please reply to this email with your responses. I'll be in touch soon to discuss your answers and provide any support you may need.
            Talk soon, ${adminName}
        `
        },
        {
            week: 8,
            subject: "Congrats on finishing!",
            message: (name, adminName) => `
            Hi ${name},
            Congratulations on completing your 8-week online fitness coaching program! I'm so proud of you for sticking with it and making it all the way to the end. Please take a few moments to answer the following questions:

            1. How do you feel now that the program is complete?
            2. What do you think was the most difficult part of the program?
            3. What do you think was the most rewarding part of the program?

            Once you've answered these questions, please reply to this email with your responses. I'll be in touch soon to discuss your answers and provide any support you may need.
            Here's to a healthier and fitter you!
            Talk soon, ${adminName}
        `
        }
    ],
    Platinum: [
        {
            week: 1,
            subject: "Welcome to Your 12-Week Online Fitness Coaching Program",
            message: (name, adminName) => `
        Hi ${name},
        Welcome to your 12-week online fitness coaching program! Over the coming weeks, you will be receiving tips and guidance to help you reach your fitness goals. This week, start by tracking your current health and fitness habits. Write down what you eat, how often you exercise, and how you feel each day. This will give you a good baseline to compare your progress against. If you have any questions, don’t hesitate to contact me. I’m here to help!
        Thank you, ${adminName}
        `
        },
        {
            week: 2,
            subject: "Understanding Your Fitness Goals",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s take a closer look at your fitness goals. What do you want to achieve? Is it to lose weight, build muscle, or increase your endurance? Write down your goals in detail. Make sure they are realistic and achievable. This will help you stay motivated and on track with your fitness program. Let me know if you need help creating your fitness goals.
        Thank you, ${adminName}
        `
        },
        {
            week: 3,
            subject: "Setting Up Your Exercise Routine",
            message: (name, adminName) => `
        Hi ${name},
        Now that you have a better understanding of your fitness goals, it’s time to create an exercise plan. Start by scheduling 30 minutes of physical activity each day. This could be anything from walking to weight training. Choose activities that you enjoy and that will help you reach your fitness goals. If you need help creating your exercise routine, let me know.
        Thank you, ${adminName}
        `
        },
        {
            week: 4,
            subject: "Designing Your Nutrition Plan",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s focus on your nutrition. Eating healthy foods will give you the energy you need to stay active and reach your fitness goals. Start by writing down what you eat each day. This will help you identify any unhealthy eating habits that you may have. Next, create a meal plan that is balanced and nutritious. Choose foods that are low in fat, sugar, and sodium. If you need help designing your nutrition plan, I’m here for you.
        Thank you, ${adminName}
        `
        },
        {
            week: 5,
            subject: "Reaching Your Fitness Milestones",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s take a look at your progress. Have you been sticking to your exercise and nutrition plan? Are you seeing any results? If you need help staying on track, create some short-term goals. Set weekly or monthly milestones to help you stay focused and motivated. Let me know if you need any assistance.
        Thank you, ${adminName}
        `
        },
        {
            week: 6,
            subject: "Staying Motivated",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s focus on staying motivated. It’s easy to get discouraged when you’re not seeing results quickly. Try to keep a positive attitude and remind yourself why you started this program. Celebrate your progress and reward yourself for meeting your goals. If you need help staying motivated, let me know.
        Thank you, ${adminName}
        `
        },
        {
            week: 7,
            subject: "Mixing Things Up",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s mix things up. Doing the same exercises or eating the same foods every day can get boring. Try new activities or recipes to keep your fitness program exciting. You may even find something that you enjoy more than your usual routine. If you need help finding new exercises or recipes, let me know.
        Thank you, ${adminName}
        `
        },
        {
            week: 8,
            subject: "Avoiding Burnout",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s talk about avoiding burnout. Staying active and eating right can be tiring, so it’s important to give yourself a break. Schedule rest days throughout the week to give your body and mind a chance to recover. Take time to relax and enjoy activities that aren’t related to your fitness program. If you need help avoiding burnout, let me know.
        Thank you, ${adminName}
        `
        },
        {
            week: 9,
            subject: "Dealing With Setbacks",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s talk about dealing with setbacks. It’s normal to have days where you feel unmotivated or don’t see the results you want. Don’t let these setbacks discourage you. Remember why you started this program and focus on making small improvements. If you need help staying on track, let me know.
        Thank you, ${adminName}
        `
        },
        {
            week: 10,
            subject: "Working Out at Home",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s talk about working out at home. Exercise doesn’t have to take place in a gym. You can get just as good a workout in the comfort of your own home. Start by finding some bodyweight exercises that you can do without any equipment. You can also find online classes and tutorials to help you stay active. If you need help finding home workouts, let me know.
        Thank you, ${adminName}
        `
        },
        {
            week: 11,
            subject: "Making Healthy Lifestyle Changes",
            message: (name, adminName) => `
        Hi ${name},
        This week, let’s focus on making healthy lifestyle changes. Eating right and exercising regularly is important, but there are other habits you can adopt to help you reach your fitness goals. Get enough sleep, drink plenty of water, and manage stress. These small changes can have a big impact on your overall health and wellbeing. If you need help making healthy lifestyle changes, let me know.
        Thank you, ${adminName}
        `
        },
        {
            week: 12,
            subject: "Congratulations on Reaching Your Goals!",
            message: (name, adminName) => `
        Hi ${name},
        Congratulations on completing your 12-week online fitness coaching program! You should be proud of all the hard work you have put in. Take the time to reflect on the progress you have made. Celebrate your success and remember that you can keep achieving your fitness goals. If you need any help or guidance, don’t hesitate to contact me.
        Thank you, ${adminName}
        `
        }
    ]

}

const sendCheckInEmail = async (client, week, planType, adminName) => {
    const template = emailTemplates[planType][week - 1];
    if (!template) return;

    const mailOptions = {
        from: `Xtreme Fitness <${process.env.MAILFROM}>`,
        to: client.email,
        subject: template.subject,
        html: `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: white;
                        color: black;
                        padding: 20px;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        background-color: red;
                        color: white;
                        padding: 10px;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .footer {
                        text-align: center;
                        padding: 10px;
                        font-size: 0.8em;
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${template.subject}</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${client.name},</p>
                        <p>${template.message(client.name, adminName)}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Xtreme Fitness. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Check-in email sent to ${client.email} (Name: ${client.name}, Plan Type: ${planType}, Week: ${week})`);
    } catch (error) {
        console.error(`Error sending email to ${client.email}:`, error);
    }
};

const checkSubscriptionsAndSendEmails = async () => {
    const currentDate = new Date();

    const subscriptions = await Subscription.find({});

    const adminUser = await AdminUser.findOne({ isDeleted: false }).sort({ createdAt: 1 }).exec();
    if (!adminUser) {
        throw new Error('No active admin users found');
    }

    const adminDetails = {
        fullName: `${adminUser.firstName} ${adminUser.lastName}`
    };

    subscriptions.forEach(async (subscription) => {
        const client = await Client.findById(subscription.clientId);
        if (!client) return;

        const weeksSinceStart = Math.floor((currentDate - subscription.createdAt) / (7 * 24 * 60 * 60 * 1000)) + 1;

        let planWeeks;
        if (subscription.planType === "Silver") planWeeks = 4;
        else if (subscription.planType === "Gold") planWeeks = 8;
        else if (subscription.planType === "Platinum") planWeeks = 12;

        if (weeksSinceStart <= planWeeks) {
            await sendCheckInEmail(client, weeksSinceStart, subscription.planType, adminDetails.fullName);
        }
    });
};
;

module.exports = {
    checkSubscriptionsAndSendEmails,
};

