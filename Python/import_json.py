import json
import re
import pandas as pn

#cd Documents/dataton/dataton/Dashboard/Data

def main():
    def state(num):
        fr = open('Resultados.geojson','r')
        text = fr.read()
        fr.close()
        lst = re.findall(r"CVE_ENT(.*)OID\"", text)

        final = {}

        for i in range(0,len(lst)-1):
            cve = lst[i].split("\"")[2]
            noment = lst[i].split("\"")[6]
            final[cve] = noment

        return final


    cves= {'01': 'Ags',
    '02': 'BC',
    '03': 'BCS',
    '04': 'Cam',
    '05': 'Coah',
    '06': 'Col',
    '07': 'Chis',
    '08': 'Chi',
    '09': 'DF',
    '10': 'Dgo',
    '11': 'Gto',
    '12': 'Gro',
    '13': 'Hgo',
    '14': 'Jal',
    '15': 'Mex',
    '16': 'Mich',
    '17': 'Mor',
    '18': 'Nay',
    '19': 'NL',
    '20': 'Oax',
    '21': 'Pue',
    '22': 'Qro',
    '23': 'QRoo',
    '24': 'SLP',
    '25': 'Sin',
    '26': 'Son',
    '27': 'Tab',
    '28': 'Tam',
    '29': 'Tlax',
    '30': 'Ver',
    '31': 'Yuc',
    '32': 'Zac'}


    # SALEN
    # ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 

    filen = 'salen.json'
    fhandle = open(filen)
    data = json.load(fhandle)

    for cve in cves.iterkeys():
        #for cve in ['01']:
        i = int(cve) - 1

        curr = data[i]


        fw = open('out_state_{0}.tsv'.format(str(i)), 'w')

        fw.write("estado	visitas" + "\n")

        for j in data[i].iterkeys():
            if int(j) - 1 != i:
                fw.write(cves[j] + "\t" + str(curr[j]) + "\n")
        fw.close()

    fhandle.close()

    # ENTRAN
    # ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 

    filen = 'entran.json'
    fhandle = open(filen)
    data = json.load(fhandle)

    for cve in cves.iterkeys():
        #for cve in ['01']:
        i = int(cve) - 1

        curr = data[i]


        fw = open('in_state_{0}.tsv'.format(str(i)), 'w')

        fw.write("estado	visitas" + "\n")

        for j in range(0,len(data)):
            curr = data[j]
            if j != i:
                jkey=str(j + 1) if len(str(j + 1))>1 else ('0' + str(j + 1))

                fw.write(cves[jkey] + "\t" + str(curr[cve]) + "\n")

        fw.close()

if __name__ == '__main__':
    main()













