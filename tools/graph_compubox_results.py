import argparse
import pandas as pd
import matplotlib.pyplot as plt

def main(df, boxer_name, max_y=-1):
    title = f'{df.columns[1]} - {boxer_name}'
    ts_col = df.columns[1:2]
    if max_y < 0:
        max_y = max(df[df.columns[1]])
        max_y = max(int(1.05 * max_y), max_y + 1)
    plot = df.plot.scatter(x=df.columns[0], y=df.columns[1], c=['r', 'b', 'b', 'b', 'b', 'b'], ylim=(0, max_y))
    plt.title(title)
    plt.show()
    fig = plot.get_figure()
    fig.savefig(f"Compubox/{title}.png")

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('Compubox', type=int)
    parser.add_argument('Ben', type=int)
    parser.add_argument('Seb', type=int)
    parser.add_argument('Robin', type=int)
    parser.add_argument('Lee', type=int)
    parser.add_argument('Pardeep', type=int)
    parser.add_argument('title')
    parser.add_argument('boxer_name')
    parser.add_argument('--max_y', '-y', default=-1, type=int)
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    print(args)
    df = pd.DataFrame({'name': ['Compubox', 'Ben', 'Seb', 'Robin', 'Lee', 'Pardeep'], args.title: [args.Compubox, args.Ben, args.Seb, args.Robin, args.Lee, args.Pardeep]})
    print(df)

    main(df, args.boxer_name, args.max_y)
