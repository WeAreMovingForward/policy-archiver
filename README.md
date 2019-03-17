# #MovingForward Archiver

[Work in progress](https://github.com/gshahbazian/movingforward-archiver/projects/1)

[Example output](https://www.dropbox.com/sh/m3i4zci3cwnve6z/AAB0V3x7xGh1vVE-jL7Aej6Ia?dl=0)

## Running

Create a `.env` with your airtable api key:
```
echo 'AIRTABLE_API_KEY=_api_key_here_' > .env
```

Alternatively, you can run with an exported csv of the `#MovingForward Orgs` airtable:
```
npm start ~/#MovingForward.csv
```

The archived files are exported to the `./out` directory, with pdfs and plaintext files for each policy.
