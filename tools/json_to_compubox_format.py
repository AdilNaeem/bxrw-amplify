import json
import argparse

def main(input_file, punch_quality_labels):
    with open(input_file) as json_input:
        data = json.load(json_input)

    print(data['labelData'].keys())
    boxer1_data = data['labelData']['boxer1']['punches']
    print(boxer1_data[0])
    boxer2_data = data['labelData']['boxer2']['punches']
    print(boxer2_data[0])

    boxer1_jabs_thrown, boxer1_power_punches_thrown, boxer1_jabs_landed, boxer1_power_punches_landed = analyse(boxer1_data, punch_quality_labels)
    boxer2_jabs_thrown, boxer2_power_punches_thrown, boxer2_jabs_landed, boxer2_power_punches_landed = analyse(boxer2_data, punch_quality_labels)

    print_results(boxer1_jabs_thrown, boxer1_power_punches_thrown, boxer1_jabs_landed, boxer1_power_punches_landed, 'Boxer 1')
    print_results(boxer2_jabs_thrown, boxer2_power_punches_thrown, boxer2_jabs_landed, boxer2_power_punches_landed, 'Boxer 2')
     

def analyse(data, punch_quality_labels):
    print(f'[analyse] punch_quality_labels={punch_quality_labels}')
    jabs_t = len([p for p in data if p['punchType'] == 'Jab'])
    jabs_l = len([p for p in data if p['punchType'] == 'Jab' and p['punchQuality'] in punch_quality_labels])
    pp_t = len([p for p in data if p['punchType'] != 'Jab'])
    pp_l = len([p for p in data if p['punchType'] != 'Jab' and p['punchQuality'] in punch_quality_labels])
    return jabs_t, pp_t, jabs_l, pp_l

def print_results(jabs_thrown, pp_thrown, jabs_landed, pp_landed, title):     
    print(title)
    print('-------')
    print(f'Total punches landed/thrown: {jabs_landed + pp_landed}/{jabs_thrown + pp_thrown}')
    print(f'Jabs landed/thrown: {jabs_landed}/{jabs_thrown}')
    print(f'Power punches landed/thrown: {pp_landed}/{pp_thrown}')
    print('')

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('input_file')
    parser.add_argument('--punch_quality_labels', '-l', nargs='+', default=['1','2','3'])
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    print(args)
    main(args.input_file, args.punch_quality_labels)
