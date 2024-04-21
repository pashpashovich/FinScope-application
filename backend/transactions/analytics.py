import matplotlib.pyplot as plt
import os

def analyze_transaction_types(transactions):
    types = {transaction.transaction_type for transaction in transactions}
    type_count = {t: sum(1 for tr in transactions if tr.transaction_type == t) for t in types}
    return type_count

def average_transaction_amount(transactions):
    total_amount = sum(transaction.amount for transaction in transactions)
    average = total_amount / len(transactions) if transactions else 0
    return average

def analyze_account_balances(accounts):
    balances = {account.account_num: account.account_balance for account in accounts}
    return balances

def plot_transaction_types(type_count):
    plt.bar(type_count.keys(), type_count.values())
    plt.xlabel('Transaction Type')
    plt.ylabel('Count')
    plt.title('Transaction Type Distribution')
    plt.show()

def plot_transaction_amounts(transactions):
    amounts = [transaction.amount for transaction in transactions]
    plt.hist(amounts, bins=20, color='blue', alpha=0.7)
    plt.xlabel('Transaction Amount')
    plt.ylabel('Frequency')
    plt.title('Transaction Amount Distribution')
    plt.show()

def plot_account_balances(balances):
    labels = list(balances.keys())
    sizes = list(balances.values())
    plt.pie(sizes, labels=labels, autopct='%1.1f%%')
    plt.title('Account Balance Distribution')
    plt.show()

def saving_plot(file_name):
    plt.savefig(file_name)
    plt.clf()