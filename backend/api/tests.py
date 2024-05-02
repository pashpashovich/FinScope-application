import pytest
import matplotlib.pyplot as plt
from .views import plot_transaction_types

@pytest.fixture
def type_count():
    return {'Deposit': 10, 'Withdrawal': 20}

@pytest.mark.mpl_image_compare
def test_plot_transaction_types(type_count):
    plot_transaction_types(type_count)

    return plt.gcf()
