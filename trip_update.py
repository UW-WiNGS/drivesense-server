import requests
for guid in range(300,310):
  payload = """{"guid":"%d","traces":[ %s ]}"""
  trace = """{ "type": "Trip", "value":
       { "brake": 0,
         "score": 10,
         "tilt": 89.95438,
         "alt": 0,
         "lat": 43,
         "lng": -89.004,
         "speed": 0,
         "time": %d 
       }
     }"""
  traces = []
  for i in range(190000):
    traces.append(trace%(i))
    
  output = payload % (guid,",\n".join(traces))
  #print(output)


  headers = {
    "Authorization":"JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjE2LCJmaXJzdG5hbWUiOiJQZXRlciIsImxhc3RuYW1lIjoiRGVuIEhhcnRvZyIsImVtYWlsIjoicGRkZW5oYXJAZ21haWwuY29tIiwiaWF0IjoxNDc4OTAzNjA2LCJleHAiOjE0ODE0OTU2MDZ9.vb3OedFyUrGLh23-aTICG8SQ0FcmXfr893kr6IBMPpI",
    "Content-Type":"application/json"
  }
  print("Start request")
  r = requests.post("http://drivesense.io/updateTrip", data=output, headers=headers)
  print("Sent")
  print(r.status_code, r.reason)
