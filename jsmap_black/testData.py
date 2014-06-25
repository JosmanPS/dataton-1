__author__ = 'imuser'

import pandas as pn
import numpy as np



if __name__ == '__main__':
    m = pn.DataFrame()

    for k in range(0, 32):
        m[str(k)] = [int(np.random.uniform() * 1000) for i in range (0,32)]

