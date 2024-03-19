//Create Controller

//Create Repository
public void UpdateDescription(IEnumerable<GlSetupModel> model)
        {
            repo.UpdateDescription(model);
        }

//Create Service
public void UpdateDescription(IEnumerable<GlSetupModel> model)
        {
            //var identity = (ClaimsPrincipal)Thread.CurrentPrincipal;
            //string empcode = identity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault();

            try
            {
                work_disb.BeginTran();

                foreach (var item in model)
                {
                    var record = work_disb.PCFAcctCodes.Find(x => x.Id == item.Id);
                    
                    record.LastUpdate = DateTime.Now;
                    record.UpdateBy = userCode;
                    record.Descrip = item.Descrip;

                    work_disb.Save();
                }
                work_disb.Commit();
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }