export async function sendTG(text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: text.slice(0, 4096),
        parse_mode: "Markdown",
      }),
    })
  } catch (error) {
    console.error("Telegram notification failed:", error)
  }
}
