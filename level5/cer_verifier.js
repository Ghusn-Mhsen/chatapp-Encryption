module.exports = {
    verifiyCSR: async (csrPem) => {
      const forge = require("node-forge");
      const fs = require("fs");
  
      const csr = forge.pki.certificationRequestFromPem(csrPem);
  
      // Read CA cert and key
  
      const caCertPem =process.env.CAPem
      const caKeyPem = process.env.PrvCA;
      const caCert = forge.pki.certificateFromPem(caCertPem);
      const caKey = forge.pki.privateKeyFromPem(caKeyPem);
  
      if (csr.verify()) {
        console.log("Certification request (CSR) verified.");
      } else {
        throw new Error("Signature not verified.");
      }
  
      console.log("Creating certificate...");
      const cert = forge.pki.createCertificate();
      cert.serialNumber = "02";
  
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(
        cert.validity.notBefore.getFullYear() + 1
      );
  
      // subject from CSR
      cert.setSubject(csr.subject.attributes);
      // issuer from CA
      cert.setIssuer(caCert.subject.attributes);
  
      cert.setExtensions([
        {
          name: "basicConstraints",
          cA: true,
        },
        {
          name: "keyUsage",
          keyCertSign: true,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true,
        },
        {
          name: "subjectAltName",
          altNames: [
            {
              type: 6, // URI
              value: "http://example.org/webid#me",
            },
          ],
        },
      ]);
  
      cert.publicKey = csr.publicKey;
   
  
       process.env.copyCertificate = cert;

      cert.sign(caKey);
      console.log("Certificate created.");
  
      console.log("\nWriting Certificate");
    
      return forge.pki.certificateToPem(cert);
    },
  };