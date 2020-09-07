# BSD 3-Clause License

# Copyright (c) 2020, MindEarth
# All rights reserved.

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:

# 1. Redistributions of source code must retain the above copyright notice, this
#    list of conditions and the following disclaimer.

# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.

# 3. Neither the name of the copyright holder nor the names of its
#    contributors may be used to endorse or promote products derived from
#    this software without specific prior written permission.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import sys
import numpy as np
import pickle
import os
import mysql.connector

import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

db_wsf3d = mysql.connector.connect(
    host="127.0.0.1",
    user="wsf3d",
    passwd="test",
    database="wsf3d"
)

gmail_user = 'wsf3d.tanzania@gmail.com'
gmail_password = '###'

tmp_file = '/media/davide/storage/MindEarth/20200601_wsf3d/working/final report/labels.pkl'

def send_mail(to, subject, body, files):
    sender_email = gmail_user
    receiver_email = ', '.join(to)

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    # Create the plain-text and HTML version of your message
    text = body

    # Turn these into plain/html MIMEText objects
    part1 = MIMEText(text, "plain")

    # Add HTML/plain-text parts to MIMEMultipart message
    # The email client will try to render the last part first
    message.attach(part1)

    # do the attachments
    for f in files or []:
        with open(f, "rb") as fil:
            part = MIMEApplication(
                fil.read(),
                Name=os.path.basename(f)
            )
        # After the file is closed
        part['Content-Disposition'] = 'attachment; filename="%s"' % os.path.basename(f)
        message.attach(part)


    # Create secure connection with server and send email

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, gmail_password)
        server.sendmail(
            sender_email, receiver_email, message.as_string()
        )
        server.close()


db_cursor_wsf = db_wsf3d.cursor()

# first week
# query = '''SELECT id, task_id, lcase(user), full_name, skip, floors, total_time, loading_time, solving_time, date(convert_tz(submitted_at, '+00:00', '+03:00')), payment_phone
#             FROM labels join users on labels.user = users.uname where users.type > 0 and
#             date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-06\' and \'2020-07-10\''''

# second week
# query = '''SELECT id, task_id, lcase(user), full_name, skip, floors, total_time, loading_time, solving_time, date(convert_tz(submitted_at, '+00:00', '+03:00')), payment_phone
#             FROM labels join users on labels.user = users.uname where users.type > 0 and
#             date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-13\' and \'2020-07-17\''''

# third week
# query = '''SELECT id, task_id, lcase(user), full_name, skip, floors, total_time, loading_time, solving_time, date(convert_tz(submitted_at, '+00:00', '+03:00')), payment_phone
#             FROM labels join users on labels.user = users.uname where users.type > 0 and
#             date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-20\' and \'2020-07-24\''''

# final week
# query = '''SELECT id, task_id, lcase(user), full_name, skip, floors, total_time, loading_time, solving_time, date(convert_tz(submitted_at, '+00:00', '+03:00')), payment_phone
#             FROM labels join users on labels.user = users.uname where users.type > 0 and
#             date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-27\' and \'2020-07-29\''''

# overall
# query = '''SELECT id, task_id, lcase(user), full_name, skip, floors, total_time, loading_time, solving_time, date(convert_tz(submitted_at, '+00:00', '+03:00')), payment_phone
#             FROM labels join users on labels.user = users.uname where users.type > 0 and (
#             (date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-27\' and \'2020-07-29\') OR
#             (date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-20\' and \'2020-07-24\') OR
#             (date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-13\' and \'2020-07-17\') OR
#             (date(convert_tz(submitted_at, '+00:00', '+03:00')) between \'2020-07-06\' and \'2020-07-10\')
#             )'''

# old query
# query = '''SELECT id, task_id, user, full_name, skip, floors, total_time, loading_time, solving_time, date(convert_tz(submitted_at, '+00:00', '+03:00'))
#             FROM labels join users on labels.user = users.uname where users.type = 1 and ((labels.skip = 0 and floors is not null) or labels.skip = 1)'''

# db_cursor_wsf.execute(query)
# labels = db_cursor_wsf.fetchall()
#

# with open(tmp_file, 'wb') as f:
#     pickle.dump(labels, f)
#
# sys.exit(0)

with open(tmp_file, 'rb') as f:
    labels = pickle.load(f)

tasks = {}
users = {}
details = {}

# aggregate labels

for l in labels:
    id, task_id, user, full_name, skip, floors, total_time, loading_time, solving_time, date, payment_phone = l
    user = user.strip()
    details[user] = {'full_name': full_name.replace(',',' '), 'payment_phone': payment_phone}

    if task_id not in tasks:
        tasks[task_id] = {'labels': np.zeros(11)}

    if skip == 1:
        tasks[task_id]['labels'][0] = tasks[task_id]['labels'][0] + 1
    else:
        tasks[task_id]['labels'][floors] = tasks[task_id]['labels'][floors] + 1

    if user not in users:
        users[user] = {}

    if date not in users[user]:
        users[user][date] = { 'tasks': [], 'total_time': 0, 'loading_time': 0}

    lb = None
    if skip == 1:
        lb = 0
    else:
        lb = floors

    users[user][date]['tasks'].append((task_id, lb))
    users[user][date]['total_time'] = users[user][date]['total_time'] + total_time
    users[user][date]['loading_time'] = users[user][date]['loading_time'] + loading_time

# establish tasks consensus
for id, t in tasks.items():
    if np.sum(t['labels']) >= 10:
        t['consensus'] = np.argmax(t['labels'])
        t['strenght'] = t['labels'][t['consensus']] / sum(t['labels'])

# user stats
for user, v in users.items():
    for date, v2 in v.items():
        v2['total_solved'] = 0
        v2['total_solved_w'] = 0
        v2['correct'] = 0
        v2['correct_w'] = 0

        for t_id, t_lb in v2['tasks']:
            if 'consensus' in tasks[t_id]:
                v2['total_solved'] = v2['total_solved'] + 1
                v2['total_solved_w'] = v2['total_solved_w'] + tasks[t_id]['strenght']

                if t_lb == tasks[t_id]['consensus']:
                    v2['correct'] = v2['correct'] + 1
                    v2['correct_w'] = v2['correct_w'] + tasks[t_id]['strenght']

with open('/tmp/stats.csv', 'w') as f:
    f.write(','.join(['user', 'full name', 'payment phone', 'date', 'loading time', 'total time', 'N tasks', 'correctness', 'time score', 'tasks score', 'precision score', 'total score', 'payment'])+'\n')
    for user, v in users.items():
        for date, v2 in v.items():
            v2['time_score'] = max(0, min(1, v2['total_time']/(2*3600)))*0.5
            v2['tasks_score'] = max(0, min(1, len(v2['tasks'])/500))*0.5
            v2['precision_score'] = max(0, min(1, (v2['correct_w']/v2['total_solved_w'] if v2['total_solved_w'] > 0 else 1)/0.75))
            v2['total_score'] = (v2['time_score']+v2['tasks_score'])*v2['precision_score']
            v2['payment'] = v2['total_score']*20000

            f.write('{:}, {:}, {:}, {:}, {:.2f}, {:.2f}, {:}, {:.2f}, {:.2f}, {:.2f}, {:.2f}, {:.2f}, {:.2f}\n'.format(user, details[user]['full_name'], details[user]['payment_phone'], date, v2['loading_time'], v2['total_time'], len(v2['tasks']), (v2['correct_w']/v2['total_solved_w'] if v2['total_solved_w'] > 0 else 1.0), v2['time_score'], v2['tasks_score'], v2['precision_score'], v2['total_score'], v2['payment']))

aggregated = {}

for user, v in users.items():
    aggregated[user] = {'payment': 0 }
    for date, v2 in v.items():
        aggregated[user]['payment'] = aggregated[user]['payment'] + v2['payment']

with open('/tmp/stats_aggregated.csv', 'w') as f:
    f.write(','.join(['user', 'full name', 'payment phone', 'payment'])+'\n')
    for user, v in aggregated.items():
        f.write('{:}, {:}, {:}, {:.0f}\n'.format(user, details[user]['full_name'], details[user]['payment_phone'], v['payment']))


# to = ['davide.cucci@mindearth.org', 'msilikale.msilanga@utu.fi', 'msilikalemsilanga@gmail.com']
# subject = 'WSF3D - users\' statistcs'
#
# # second week
# # body = 'Please find attached the suggested payments\' between 2020-07-13 and 2020-07-17'
#
# # third week
# # body = 'Please find attached the suggested payments\' between 2020-07-20 and 2020-07-24'
#
# # final week
# body = 'Please find attached the suggested payments\' between 2020-07-27 and 2020-07-29'
#
#
# send_mail(to, subject, body, ['/tmp/stats_aggregated.csv', '/tmp/stats.csv'])
