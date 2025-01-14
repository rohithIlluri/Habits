from openai import AsyncOpenAI

aclient = AsyncOpenAI(api_key="OPEN_AI_API_KEY")
from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackContext
import sqlite3
from datetime import datetime


# Database setup
def setup_db():
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            habit_name TEXT,
            frequency TEXT,
            streak INTEGER DEFAULT 0,
            last_updated DATE
        )
    """)
    conn.commit()
    conn.close()

# Habit motivation using OpenAI
async def motivate(update: Update, context: CallbackContext):
    habit_name = " ".join(context.args)
    if not habit_name:
        await update.message.reply_text("Please specify a habit for motivation. E.g., /motivate Drink water")
        return

    prompt = f"Provide a motivational message for someone working on the habit '{habit_name}'."
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        message = response['choices'][0]['message']['content'].strip()
        await update.message.reply_text(message)
    except Exception as e:
        # Fallback motivational message
        fallback_message = f"Keep going! Building the habit '{habit_name}' is a step toward personal growth."
        await update.message.reply_text(f"Error generating motivation: {e}\nUsing fallback response:\n{fallback_message}")

# Habit suggestions using OpenAI
async def suggest_habits(update: Update, context: CallbackContext):
    user_message = " ".join(context.args) or "Provide habit suggestions for health, productivity, and lifestyle."
    prompt = f"Generate a few simple habit ideas. {user_message}"
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        suggestions = response['choices'][0]['message']['content'].strip()
        await update.message.reply_text(f"Here are some habit ideas:\n{suggestions}")
    except Exception as e:
        # Fallback habit suggestions
        fallback_suggestions = (
            "1. Drink a glass of water first thing in the morning.\n"
            "2. Write down three things you're grateful for each day.\n"
            "3. Take a 5-minute walk after every meal."
        )
        await update.message.reply_text(f"Error generating suggestions: {e}\nUsing fallback suggestions:\n{fallback_suggestions}")


# Add habit command
async def add_habit(update: Update, context: CallbackContext):
    user_id = update.message.from_user.id
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Usage: /add_habit habit_name frequency")
        return
    habit_name = args[0]
    frequency = " ".join(args[1:])

    try:
        conn = sqlite3.connect("habits.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO habits (user_id, habit_name, frequency) VALUES (?, ?, ?)",
                       (user_id, habit_name, frequency))
        conn.commit()
        conn.close()
        await update.message.reply_text(f"Habit '{habit_name}' added with frequency '{frequency}'!")
    except Exception as e:
        await update.message.reply_text(f"Error adding habit: {e}")

# Main function
def main():
    setup_db()

    # Initialize the Application
    application = Application.builder().token("TG_KEY").build()

    # Add command handlers
    application.add_handler(CommandHandler("add_habit", add_habit))
    application.add_handler(CommandHandler("motivate", motivate))
    application.add_handler(CommandHandler("suggest_habits", suggest_habits))

    # Start polling
    application.run_polling()

if __name__ == "__main__":
    main()
