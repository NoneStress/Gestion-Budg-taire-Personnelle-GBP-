import streamlit as st
import joblib
import os

# Load the model and vectorizer
model = joblib.load(os.path.join(os.path.dirname(__file__), '..', '..', 'ml_project', 'models', 'expense_categorizer_model.pkl'))
vectorizer = joblib.load(os.path.join(os.path.dirname(__file__), '..', '..', 'ml_project', 'models', 'vectorizer.pkl'))

st.title("Expense Categorizer")

description = st.text_input("Enter expense description:")

if st.button("Categorize"):
    if description:
        X = vectorizer.transform([description])
        pred = model.predict(X)[0]
        prob = model.predict_proba(X)[0].max() * 100
        st.write(f"Category: {pred}")
        st.write(f"Confidence: {prob:.2f}%")
    else:
        st.error("Please enter a description")
