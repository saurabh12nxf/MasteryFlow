import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendMissionReminderParams {
    to: string;
    username: string;
    missionDate: string;
    tasksCount: number;
    estimatedMinutes: number;
}

export async function sendMissionReminder({
    to,
    username,
    missionDate,
    tasksCount,
    estimatedMinutes,
}: SendMissionReminderParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: "MasteryFlow <missions@masteryflow.app>",
            to: [to],
            subject: `🎯 Your Daily Mission is Ready!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Good Morning, ${username}!</h1>
          
          <p>Your daily learning mission for <strong>${missionDate}</strong> is ready.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Today's Mission</h2>
            <p style="font-size: 18px; margin: 10px 0;">
              📚 <strong>${tasksCount}</strong> tasks
            </p>
            <p style="font-size: 18px; margin: 10px 0;">
              ⏱️ <strong>${estimatedMinutes}</strong> minutes total
            </p>
          </div>
          
          <p>Let's make today count! Complete your mission to:</p>
          <ul>
            <li>Earn XP and level up</li>
            <li>Maintain your streak</li>
            <li>Make progress on your learning goals</li>
          </ul>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Mission
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Keep learning, keep growing! 🚀
          </p>
        </div>
      `,
        });

        if (error) {
            console.error("Error sending email:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error sending mission reminder:", error);
        return { success: false, error };
    }
}

export interface SendStreakWarningParams {
    to: string;
    username: string;
    currentStreak: number;
}

export async function sendStreakWarning({
    to,
    username,
    currentStreak,
}: SendStreakWarningParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: "MasteryFlow <alerts@masteryflow.app>",
            to: [to],
            subject: `🔥 Don't Break Your ${currentStreak}-Day Streak!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">⚠️ Streak Alert!</h1>
          
          <p>Hey ${username},</p>
          
          <p>You're about to lose your <strong>${currentStreak}-day streak</strong>! 😱</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">
              You haven't completed today's mission yet. Don't let all your hard work go to waste!
            </p>
          </div>
          
          <p>Quick actions you can take:</p>
          <ul>
            <li>Complete at least one task from today's mission</li>
            <li>Use a streak freeze if you have one</li>
            <li>Make an open source contribution for automatic protection</li>
          </ul>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Save My Streak!
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            You've got this! 💪
          </p>
        </div>
      `,
        });

        if (error) {
            console.error("Error sending email:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error sending streak warning:", error);
        return { success: false, error };
    }
}
