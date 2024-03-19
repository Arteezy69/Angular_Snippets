//Create Model 

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Disbursements.Library.Models.PCF
{
    public class GlSetupModel
    {
        public int Id { get; set; }
        public int LineId { get; set; }
        public string BrCode { get; set; }
        public string Descrip { get; set; }
        public string AcctCode { get; set; }
        public string AcctName { get; set; }
        public bool Active { get; set; }
        public DateTime DateCreated { get; set; }
        public string CreatedBy { get; set; }
        public DateTime LastUpdate { get; set; }
        public string UpdateBy { get; set; }

    }
}
//Create Controller


//Repo
 public void PostGLAccts(IEnumerable<GlSetupModel> model)
{
    repo.PostGLAccts(model);
}



//Service- EF 
public void PostGLAccts(IEnumerable<GlSetupModel> model)
        {

            try
            {
                work_disb.BeginTran();

                foreach (var item in model)
                {

                    var gLEntity = new HPDSAP.Core.Data.DISBURSEMENTS.PCF_AcctCodes
                    {

                        Descrip=item.AcctName,
                        AcctCode=item.AcctCode,
                        Active=true,
                        DateCreated = DateTime.Now,
                        CreatedBy = userCode,
                       
                    };

                    work_disb.PCFAcctCodes.Add(gLEntity);
                }

                work_disb.Save();
                work_disb.Commit();
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }